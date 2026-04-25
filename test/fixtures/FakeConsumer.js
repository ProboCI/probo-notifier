'use strict';

class FakeConsumer {
  constructor(options) {
    options = options || {};
    this.topic = options.topic || 'build';
    this._listener = null;
  }

  start() {
    return Promise.resolve();
  }

  onMessage(listener) {
    this._listener = listener;
  }

  async commit() {}

  destroy(cb) {
    if (cb) cb();
  }

  publish(data) {
    if (this._listener) this._listener(data);
  }
}

module.exports = FakeConsumer;
