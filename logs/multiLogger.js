const fs = require('fs');
const pino = require('pino');
const path = require('path');

module.exports = function getLogger() {
  const streams = [
    {stream: fs.createWriteStream(path.join(__dirname, 'info.log'))},
    {level: 'debug', stream: fs.createWriteStream(path.join(__dirname, 'debug.log'))},
    {level: 'fatal', stream: fs.createWriteStream(path.join(__dirname, 'fatal.log'))}
  ];
  
  const logger = pino({
    level: 'debug' // this MUST be set at the lowest level of all the destinations
  }, pino.multistream(streams));
  
  return logger;
}