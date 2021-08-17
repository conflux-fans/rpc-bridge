const pino = require('pino')
const fileTransporter = require('./fileTransporter');

module.exports = function getLogger (destination = '/dev/null') {
  const transport = pino.transport({
    target: fileTransporter,
    options: { destination }
  });
  return pino(transport);
}
