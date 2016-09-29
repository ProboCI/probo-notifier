'use strict';

var AbstractPlugin = require('../../lib/plugins/AbstractPlugin');

class TestPlugin extends AbstractPlugin {

  constructor(options) {
    super();
    options = options || {};
    this.history = options.history || [];
  }

  send(eventObject) {
    this.history.push({
      raw: eventObject,
      prepared: this.prepareObject(eventObject),
    });
  }
}

module.exports = TestPlugin;
