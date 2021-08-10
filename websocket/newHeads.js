const EventEmitter = require('events');
const EVENT_NAME = 'newHeads';

class NewHeads extends EventEmitter {
  constructor() {
    super();
    this.map = {};
  }

  sub(fn) {
    const id = this._randomHexNumber();
    this.on(EVENT_NAME, fn);
    this.map[id] = fn;
    return id;
  }

  unsub(id) {
    const fn = this.map[id];
    if(!fn) return;
    this.off(EVENT_NAME, fn);
    delete this.map[id];
  }

  pub(data) {
    this.emit(EVENT_NAME, data);
  }

  _randomHexNumber() {
    return '0x' + Math.ceil(Math.random() * 1000000000).toString(16);
  }
}

NewHeads.EVENT_NAME = EVENT_NAME;

module.exports = NewHeads;