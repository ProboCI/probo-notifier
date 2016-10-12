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
    this.send = this.send.bind(this);
  }

  send(eventObject) {
    var self = this;
    request.post(this.url, {body: JSON.stringify(this.prepareObject(eventObject))}, function(error, response) {
      if (error) {
        // TODO: Add more logging context!
        self.log.error(error);
      }
    });
  }

}

module.exports = WebHook;
