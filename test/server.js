'use strict';

var bunyan = require('bunyan');
var eventbus = require('probo-eventbus');
var should = require('should');
var through2 = require('through2');

var lib = require('..');
var Server = lib.Server;

var TestPlugin = require('./fixtures/TestPlugin');
var getTestBuildEvent = require('./fixtures/buildEvent');

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
        log: bunyan.createLogger({name: 'reaper-tests'}),
        plugins: {
          test: TestPlugin,
        },
      };
      options.log._level = Number.POSITIVE_INFINITY;
      server = new Server(options);
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
      stream.write(getTestBuildEvent());
    });
  });
});


