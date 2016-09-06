'use strict';

var async = require('async');
var bunyan = require('bunyan');
var events = require('events');
var levelup = require('levelup');
var _ = require('lodash');
var request = require('request');
var through2 = require('through2');

var EventEmitter = events.EventEmitter;

class Server extends EventEmitter {

  /**
   * @param {Object} options - An object containing reaper server configuration options.
   * @param {Object} options.consumer - An instantiated probo-eventbus consumer object from which to read events.
   * @param {Object} options.log - An instantiated bunyan compatible logging object.
   */
  constructor(options) {
    super();
    this.validateOptions(options);
    this.consumer = options.consumer;
    this.log = options.log || bunyan.createLogger({name: 'reaper'});
    this.messageProcessor = this.messageProcessor.bind(this);
  }

  validateOptions(options) {
    if (!options.consumer) {
      throw new Error('options.consumer is required.');
    }
    if (!options.level && !options.dataDirectory) {
      throw new Error('You must provide an instantiated level instance or a path to store the database on disk');
    }
  }

  start(done) {
    var self = this;
    this.consumer.stream.pipe(through2.obj(function(data, enc, cb) {
      self.messageProcessor(data, function() {
        cb();
      });
    }));
    this.log.info(`Now subscribed to events on ${this.consumer.topic}`);
    if (done) done();
  }

  stop(done) {
    this.consumer.destroy(done);
  }

  validateMessage(data) {
    return !data.build;
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

  messageProcessor(data, done) {
    var self = this;
    self.log.trace('Eventbus event received', data);
    if (data.event === 'ready') {
      if (!self.validateMessage(data)) {
      }
      else {
        self.log.error('Invalid build message received', data);
      }
    }
    else {
      done();
    }
  }

}

module.exports = Server;
