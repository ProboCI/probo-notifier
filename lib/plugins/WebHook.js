'use strict';

var AbstractPlugin = require('./AbstractPlugin');
var request = require('request');

class WebHook extends AbstractPlugin {

  constructor(options) {
    super();
    switch (typeof options) {
      case 'object':
        this.url = options.url;
        break;
      case 'string':
        this.url = options;
        break;
      case 'undefined':
        this.url = false;
        break;
    }

  }

  send(eventObject) {
    request.post(this.url, {body: JSON.stringify(this.prepareObject(eventObject))});
  }

}

module.exports = WebHook;
