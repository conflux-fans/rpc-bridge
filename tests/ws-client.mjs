import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3040');

ws.on('open', function open() {
  let jsonReq = {
    method: 'eth_blockNumber',
    params: []
  };

  // jsonReq = {
  //   method: 'eth_subscribe',
  //   params: ['newHeads']
  // };

  ws.send(JSON.stringify(Object.assign({
    jsonrpc: '2.0',
    id: Date.now(),
  }, jsonReq)));
});

ws.on('message', function incoming(message) {
  console.log('received: %s', message);
});


setInterval(function() {

}, 1000)