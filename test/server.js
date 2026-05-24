'use strict';

const should = require('should');

const Server = require('../lib/Server');

const FakeConsumer = require('./fixtures/FakeConsumer');
const TestPlugin = require('./fixtures/TestPlugin');
const getTestBuildEvent = require('./fixtures/buildEvent');

var consumer = null;
var server = null;

describe('Server', function() {
  describe('webhook routing', function() {
    beforeEach(function(done) {
      consumer = new FakeConsumer();

      var options = {
        consumer: consumer,
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

      consumer.publish(getTestBuildEvent());
    });

  });
});
