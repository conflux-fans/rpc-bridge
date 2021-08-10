const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const NewHeadEmitter = require('./newHeads');
const getMiddlewareEngine = require('../getMiddlewareEngine');
const CONFIG = require('../config.json');
const { buildJsonRpcRes } = require('../utils');
const format = require('web3-providers-http-proxy/src/utils/format');

const SUB_METHOD = 'eth_subscribe';
const UNSUB_METHOD = 'eth_unsubscribe';
const LOG_EVENT = 'logs';
const ETH_SUBSCRIPTION = 'eth_subscription';

// create a websocket connection to server and subscribe the 'newHeads` event
function subscribeNewHead(newHeadEmitter) {
  const ws = new WebSocket(CONFIG.wsUrl);
  const subReqId = newHeadEmitter._randomHexNumber();
  let logSubId;
  
  ws.on('open', function open() {
    const jsonReq = { 
      "jsonrpc": "2.0", 
      "method": "cfx_subscribe", 
      "params": ["newHeads"], 
      "id": subReqId,
    };
    ws.send(JSON.stringify(jsonReq));
  });

  ws.on('message', function incoming(message) {
    if (!logSubId) {
      const _tmp = JSON.parse(message);
      if (_tmp.id === subReqId) {
        logSubId = _tmp.result;
      }
      return
    }
    newHeadEmitter.pub(message);
  });

  ws.on('close', () => {
    // TODO: cancel newHead subscription
  });
}

async function startWsServer() {
  const newHeadEmitter = new NewHeadEmitter();
  subscribeNewHead(newHeadEmitter);
  
  const engine = await getMiddlewareEngine(CONFIG.url);
  const wsServer = new WebSocketServer({ port: CONFIG.wsPort });

  wsServer.on('connection', onNewConnection);

  //
  wsServer.on('error', (err) => {
    console.log('wsServer error: ', err);
  });

  wsServer.on('listening', () => {
    console.log('Websocket Server listening');
  });

  wsServer.on('close', () => {
    console.log('wsServer closed');
  });

  function onNewConnection(ws) {
    ws.on('message', onIncomingMsg);
  
    ws.on('close', async function close() {
      if(ws.newHeadsID) {
        newHeadEmitter.unsub(ws.newHeadsID);
      }
      // TODO: 如果订阅了 logs 事件，需进行取消操作
    });

    async function onIncomingMsg(message) {
      try {
        const body = JSON.parse(message);
        const { id, method, params } = body;
        // Normal RPC methods
        if (method !== SUB_METHOD && method !== UNSUB_METHOD) {
          const response = await engine.handle(body);
          sendResponse(response);
          return;
        }

        // Unsubscribe method
        if (method === UNSUB_METHOD) {
          newHeadEmitter.unsub(params[0]);
        }
        
        // handle 'eth_subscribe' method
        if (method === SUB_METHOD) {
          if (params[0] === NewHeadEmitter.EVENT_NAME) {  // 'newHeads' event
            const subId = newHeadEmitter.sub(msg => {
              try {
                msg = JSON.parse(msg);
                msg.method = ETH_SUBSCRIPTION;
                msg.params.result = format.formatBlock(msg.params.result);
                msg.params.subscription = subId;
                ws.send(JSON.stringify(msg));
              } catch(e) {
                console.log('Head event parse error');
              }
            });
            ws.newHeadsID = subId;
            const response = buildJsonRpcRes({
              id,
              result: subId,
            })
            sendResponse(response);
            return;
          } else if(params[0] === LOG_EVENT) {
            // TODO 订阅 log 事件，并记录 event id
          }
        }

      } catch (e) {
        const response = buildJsonRpcRes({
          error: {
            code: -32600, 
            message: e.message
          }
        });
        sendResponse(response);
      }
    }

    // send response data
    function sendResponse (data) {
      ws.send(JSON.stringify(data));
    }
  }

}

startWsServer().catch(console.log);
