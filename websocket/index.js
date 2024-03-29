const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const NewHeadEmitter = require('./newHeads');
const getMiddlewareEngine = require('../getMiddlewareEngine');
const CONFIG = require('../config.json');
const { buildJsonRpcRes } = require('../utils');
const format = require('web3-providers-http-proxy/src/utils/format');
const {
  SUB_METHOD,
  UNSUB_METHOD,
  CFX_SUB_METHOD,
  CFX_UNSUB_METHOD,
  LOG_EVENT,
  ETH_SUBSCRIPTION,
  NEW_HEADS_EVENT,
} = require('./consts');

// create a websocket connection to server and subscribe the 'newHeads` event
function subscribeNewHead(newHeadEmitter) {
  const ws = new WebSocket(CONFIG.wsUrl);
  const subReqId = newHeadEmitter._randomHexNumber();
  let logSubId;
  
  ws.on('open', function open() {
    const jsonReq = { 
      id: subReqId,
      jsonrpc: "2.0", 
      method: CFX_SUB_METHOD,
      params: [NEW_HEADS_EVENT], 
    };
    ws.send(JSON.stringify(jsonReq));
  });

  ws.on('message', function incoming(message) {
    const _tmp = JSON.parse(message);
    if (!logSubId && _tmp.id === subReqId) {
        logSubId = _tmp.result;
      return
    }
    _tmp.method = ETH_SUBSCRIPTION;
    _tmp.params.result = format.formatBlock(_tmp.params.result);
    newHeadEmitter.pub(_tmp);
  });

  ws.on('close', () => {
    // TODO: cancel all newHead subscription
  });
}

async function startWsServer() {
  const newHeadEmitter = new NewHeadEmitter();
  subscribeNewHead(newHeadEmitter);
  
  const engine = await getMiddlewareEngine(CONFIG.wsUrl);
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

  const logChannels = {};

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
        const { id, method, params, jsonrpc } = body;
        // Normal RPC methods
        if (method !== SUB_METHOD && method !== UNSUB_METHOD) {
          const response = await engine.handle(body);
          sendResponse(response);
          return;
        }

        // Unsubscribe method
        if (method === UNSUB_METHOD) {
          const _subId = params[0];
          const _channel = logChannels[_subId];
          if (_channel) {  // unsub logs
            _channel.send(JSON.stringify({
              id, 
              jsonrpc,
              method: CFX_UNSUB_METHOD,
              params
            }));
            _channel.close();
            delete logChannels[_subId];
          } else {  // unsub newHeads 
            newHeadEmitter.unsub(_subId);
          }
          return;
        }
        
        // handle 'eth_subscribe' method
        const _topic = params[0];
        if (_topic === NEW_HEADS_EVENT) {  // 'newHeads' event
          const subId = newHeadEmitter.sub(msg => {
            msg.params.subscription = subId;
            sendResponse(msg);
          });
          ws.newHeadsID = subId;
          sendResponse(buildJsonRpcRes({
            id,
            result: subId,
          }));
          return;
        } else if(_topic === LOG_EVENT) {
          const logWs = new WebSocket(CONFIG.wsUrl);
          
          logWs.on('open', function open() {
            if(params[1]) {
              params[1] = _formatFilter(params[1]);
            }
            logWs.send(JSON.stringify({
              id,
              jsonrpc,
              method: CFX_SUB_METHOD,
              params,
            }));
          });

          logWs.on('message', function incoming(logMsg) {
            const _response = JSON.parse(logMsg);
            // the subscription id
            if(!_response.method) {
              logChannels[_response.result] = logWs;
              ws.send(logMsg);
              return;
            }
            //
            if (_response.params.result.revertTo) {
              // TODO: handle the revert situation
              return
            }
            //
            _response.method = ETH_SUBSCRIPTION;
            format.formatLog(_response.params.result);  // adapt log
            sendResponse(_response);
          });

          logWs.on('close', () => {
            // 
          });
        }

      } catch (e) {
        sendResponse(buildJsonRpcRes({
          id: 0,
          error: {
            code: -32600, 
            message: e.message
          }
        }));
      }
    }

    // send response data
    function sendResponse (data) {
      ws.send(JSON.stringify(data));
    }
  }

  function _formatFilter(filter) {
    let {address, topics} = filter;
    if (address) {
      if (Array.isArray(address)) {
        address = address.map(a => format.formatAddress(a, engine.networkId));
      } else {
        address = format.formatAddress(address, engine.networkId);
      }
    }
    return {
      address,
      topics
    };
  }

}

startWsServer().catch(console.log);
