'use strict';
var Riker = require('riker');
var Command = Riker.Command;

var bunyan = require('bunyan');
var eventbus = require('probo-eventbus');

var Server = require('../Server');

class ServerCommand extends Command {
  constructor(options) {
    options = options || {};
    super(options);
    this.commandName = 'server';
    this.shortDescription = options.shortDescription || 'Starts the notifier server to send out notification on probo build events.';
    this.help = options.help || 'help placeholder';
    this.help = 'help placeholder';
    this.addParameter('')
      .describe('how pings are ponged!')
      .alias('p');
  }
  run(done) {
    var options = {
      // TODO: Make the plugin and its configuration configurable.
      consumer: new eventbus.plugins.Kafka.Consumer({
        topic: 'build_events',
        group: 'notifier',
        version: 1,
      }),
      logger: bunyan.createLogger({name: 'notifier'}),
    };
    var server = new Server(options);
    server.start(done);
  }
}

module.exports = ServerCommand;
