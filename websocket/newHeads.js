const EventEmitter = require('events');
const { NEW_HEADS_EVENT } = require('./consts');

class NewHeads extends EventEmitter {
  constructor() {
    super();
    this.map = {};
  }

  sub(fn) {
    const id = this._randomHexNumber();
    this.on(NEW_HEADS_EVENT, fn);
    this.map[id] = fn;
    return id;
  }

  unsub(id) {
    const fn = this.map[id];
    if(!fn) return;
    this.off(NEW_HEADS_EVENT, fn);
    delete this.map[id];
  }

  pub(data) {
    this.emit(NEW_HEADS_EVENT, data);
  }

  _randomHexNumber() {
    return '0x' + Math.ceil(Math.random() * 1000000000).toString(16);
  }
}

module.exports = NewHeads;