'use strict';

const Riker = require('riker');

const EventConsumer = require('../event_consumer');
const Server = require('../Server');

const Command = Riker.Command;

class ServerCommand extends Command {
  constructor(options) {
    options = options || {};
    super(options);
    this.commandName = 'server';
    this.shortDescription = options.shortDescription || 'Starts the notifier server to send out notification on probo build events.';
    this.help = options.help || 'help placeholder';
    this.help = 'help placeholder';
    this.addParameter('config')
      .describe('The configuration file')
      .alias('c');
    this.addParameter('port')
      .describe('The port to listen on for API requests')
      .alias('p');
  }
  configure(config, done) {
    this.config = config;
    done();
  }
  run(done) {
    let streamConfig = this.config.eventStreams.build_events.config;
    streamConfig.plugin = this.config.eventStreams.build_events.plugin;
    let options = {
      config: this.config,
      consumer: new EventConsumer(streamConfig),
    };

    var server = new Server(options);
    server.start(done);
  }
}

module.exports = ServerCommand;
