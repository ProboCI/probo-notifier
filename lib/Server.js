'use strict';

var bunyan = require('bunyan');
var events = require('events');
var request = require('request');
var through2 = require('through2');

var notifyPlugins = require('./plugins');

var EventEmitter = events.EventEmitter;

class Server extends EventEmitter {

  /**
   * @param {Object} options - An object containing reaper server configuration options.
   * @param {Object} options.consumer - An instantiated probo-eventbus consumer object from which to read events.
   * @param {Object} options.plugins - An object containing compatible plugin classes.
   * @param {Object} options.request - An object compatible with request module for testing.
   * @param {Object} options.log - An instantiated bunyan compatible logging object.
   */
  constructor(options) {
    super();
    this.validateOptions(options);
    this.consumer = options.consumer;
    this.log = options.log || bunyan.createLogger({name: 'notifier'});
    this.messageProcessor = this.messageProcessor.bind(this);
    // Allow the HTTP library to injected for unit testing.
    this.request = options.request || request;

    this.notifyPlugins = {};
    var plugins = options.plugins || notifyPlugins;
    for (let name in plugins) {
      if (plugins.hasOwnProperty(name) && name !== 'AbstractPlugin') {
        this.notifyPlugins[name.toLowerCase()] = plugins[name];
      }
    }

  }

  validateOptions(options) {
    if (!options.consumer) {
      throw new Error('options.consumer is required.');
    }
  }

  start(done) {
    var self = this;
    self.consumer.stream.pipe(through2.obj(function(data, enc, cb) {
      if (self.validateMessage(data)) {
        self.messageProcessor(data, cb);
      }
    }));
    this.log.info(`Now subscribed to events on ${this.consumer.topic}`);
    if (done) done();
  }

  stop(done) {
    this.consumer.destroy(done);
  }

  validateMessage(data) {
    if (!data.build) {
      return false;
    }
    return true;
  }

  getLogContext(build) {
    var context = {
      buildId: build.id,
    };
    if (build.project && build.project.id) {
      context.projectId = build.project.id;
    }
    if (build.project.organization && build.project.organization) {
      context.organizationId = build.project.organization.id;
    }
    return context;
  }

  // TODO: Bust this up into smaller functions.
  messageProcessor(data, done) {
    var self = this;
    self.log.trace('Eventbus event received', data);
    if (data.build.config.notifications) {
      for (let pluginName in data.build.config.notifications) {
        if (self.notifyPlugins[pluginName]) {
          let notifications = data.build.config.notifications[pluginName];
          if (!Array.isArray(notifications)) {
            notifications = [notifications];
          }
          for (let notification of notifications) {
            try {
              let plugin = new self.notifyPlugins[pluginName](notification);
              // TODO: Return control here for logging at the very least?
              plugin.send(data);
            }
            catch (error) {
              self.log.error(`Failure to send notification for ${data.build.id} with plugin ${pluginName}`, {err: error});
            }
          }
        }
      }
      self.emit('buildReceived', data.build);
      done();
    }
    else {
      self.log.error('Invalid build message received', data);
      self.emit('buildReceived', data.build);
      done();
    }
  }

}

module.exports = Server;
