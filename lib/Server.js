'use strict';

const events = require('events');
const logger = require('./logger').get();
const request = require('request');

const notifyPlugins = require('./plugins');

const EventEmitter = events.EventEmitter;

class Server extends EventEmitter {

  /**
   * @param {Object} config - An object containing server configuration.
   * @param {Object} config.consumer - An instantiated probo-eventbus consumer
   *   object from which to read events.
   * @param {Object} config.plugins - An object containing compatible plugin
   *   classes.
   * @param {Object} config.request - An object compatible with request module
   *   for testing.
   * @param {Object} cothis.logger - An instantiated bunyan compatible logging
   *   object.
   */
  constructor(config) {
    super();

    this.consumer = config.consumer;
    this.messageProcessor = this.messageProcessor.bind(this);

    // Allow the HTTP library to injected for unit testing.
    this.request = config.request || request;

    /** @type {import('bunyan')} this.logger */
    this.logger = logger;

    this.notifyPlugins = {};
    var plugins = config.plugins || notifyPlugins;
    for (let name in plugins) {
      if (plugins.hasOwnProperty(name) && name !== 'AbstractPlugin') {
        this.notifyPlugins[name.toLowerCase()] = plugins[name];
      }
    }

  }

  start(cb) {
    this.consumer.start()
      .then(() => {

        this.consumer.onMessage(data => {
          if (!this.validateMessage(data)) return;

          this.messageProcessor(data, err => {
            if (!err) {
              this.consumer.commit();
            }
          });

        });

        this.logger.info(`Now subscribed to events on ${this.consumer.topic}`);

        if (cb) cb();
      });
  }

  stop(cb) {
    this.consumer.destroy(cb);
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
  messageProcessor(data, cb) {
    this.logger.trace('Eventbus event received', data);
    if (data.build.config.notifications) {

      for (let pluginName in data.build.config.notifications) {

        if (this.notifyPlugins[pluginName]) {
          let notifications = data.build.config.notifications[pluginName];
          if (!Array.isArray(notifications)) {
            notifications = [notifications];
          }
          for (let notification of notifications) {
            try {
              let plugin = new this.notifyPlugins[pluginName](notification);
              // TODO: Return control here for logging at the very least?
              plugin.send(data);
            }
            catch (error) {
              this.logger.error(`Failure to send notification for ${data.build.id} with plugin ${pluginName}`, {err: error});

              cb(error);
            }
          }
        }
      }

      this.emit('buildReceived', data.build);
      cb();
    }
    else {
      this.logger.error('Build does not have any notifications enabled', data);
      this.emit('buildReceived', data.build);
      cb();
    }
  }

}

module.exports = Server;
