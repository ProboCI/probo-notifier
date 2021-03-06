'use strict';

const eventbus = require('probo-eventbus');
const should = require('should');
const through2 = require('through2');

const Server = require('../lib/Server');

const TestPlugin = require('./fixtures/TestPlugin');
const getTestBuildEvent = require('./fixtures/buildEvent');

// We use a simple method to reset the world between tests by
// using global variables.
var stream = null;
var server = null;

describe('Server', function() {
  describe('webhook routing', function() {
    beforeEach(function(done) {
      stream = through2.obj();

      var options = {
        consumer: new eventbus.plugins.Memory.Consumer({stream}),
        plugins: {
          test: TestPlugin,
        },
      };
      server = new Server(options);

      server.logger.level(Number.POSITIVE_INFINITY);

      server.start(done);
    });

    afterEach(function(done) {
      server.stop(done);
    });

    it('send notifications via the appropriate plugin', function(done) {
      server.on('buildReceived', function() {
        should.exist(server);
        done();
      });

      const message = {
        data: getTestBuildEvent(),
      };

      stream.write(message);
    });

  });
});


