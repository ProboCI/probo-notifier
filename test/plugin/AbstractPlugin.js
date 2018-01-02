'use strict';

var should = require('should');
var TestPlugin = require('../fixtures/TestPlugin');
var AbstractPlugin = require('../../lib/plugins').AbstractPlugin;
var getTestBuildEvent = require('../fixtures/buildEvent');

describe('AbstractPlugin', function() {
  describe('prepareObject', function() {
    it('should throw an exception if instantiated without being extended', function() {
      try {
        new AbstractPlugin();
      }
      catch (e) {
        should.exist(e);
        return;
      }
      throw new Error('An exception should have been thrown by AbstractPlugin');
    });
    it('should prepare a sanitized object', function() {
      should.exist(new TestPlugin().prepareObject({build: {}}).build.links);
      new TestPlugin().prepareObject({build: {links: {a: 'b'}}}).build.links.a.should.equal('b');
      should.not.exist(new TestPlugin().prepareObject({build: {foo: 'bar'}}).foo);
      Object.keys(new TestPlugin().prepareObject(getTestBuildEvent()).build).length.should.equal(14, 'The appropiate number of keys are included in the sanitized object.');
    });
  });
  describe('templateString', function() {
    // new TestPlugin().
  });
});
