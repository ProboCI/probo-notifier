'use strict';

var async = require('async');
var bunyan = require('bunyan');
var levelup = require('levelup');
var _ = require('lodash');
var memdown = require('memdown');
var nock = require('nock');
var eventbus = require('probo-eventbus');
var request = require('request');
var should = require('should');
var through2 = require('through2');

var lib = require('..');
var Server = lib.Server;

// We use a simple method to reset the world between tests by
// using global variables.
var stream = null;
var server = null;
var storage = null;

describe('Server', function() {
  const apiServerHost = 'localhost';
  const apiServerPort = 3038;
  const containerManagerUrl = 'http://localhost:9631';

  describe('event storage', function() {
    beforeEach(function(done) {
      stream = through2.obj();
      var options = {
        consumer: new eventbus.plugins.Memory.Consumer({stream}),
        log: bunyan.createLogger({name: 'reaper-tests'}),
      };
      options.log._level = Number.POSITIVE_INFINITY;
      server = new Server(options);
      server.start(done);
    });
    afterEach(function(done) {
      server.stop(done);
    });
    it('should export data', function(done) {
      stream.write(getTestBuildEvent());
      server.on('buildReceived', function() {
        request(`http://${apiServerHost}:${apiServerPort}/api/export-data`, function(error, response, body) {
          should.not.exist(error);
          response.statusCode.should.equal(200);
          body = body.split('\n');
          JSON.parse(body[0]).key.should.equal('build!!build 1');
          JSON.parse(body[1]).key.should.equal('build_date!!2016-02-27T05:44:46.947Z!!build 1');
          JSON.parse(body[2]).key.should.equal('organization_build!!organization 1!!2016-02-27T05:44:46.947Z!!build 1');
          JSON.parse(body[3]).key.should.equal('project_branch_build!!project 1!!branch 1!!2016-02-27T05:44:46.947Z!!build 1');
          done();
        });
      });
    });
  });
});
