'use strict';

var Mustache = require('mustache');

class AbstractPlugin {

  constructor() {
    if (this.constructor === AbstractPlugin) {
      throw new Error('Can\'t instantiate abstract class!');
    }
    this.buildObjectFields = [
      'links',
      'pullRequest',
      'commit',
      'branch',
      'diskSpace',
      'steps',
    ];
    this.buildSingleFields = [
      'status',
      'createdAt',
      'updatedAt',
      'reaped',
      'name',
      'id',
    ];
  }

  prepareObject(input) {
    var output = {
      build: {},
      // TODO: Update this
      event: '',
    };
    for (let name of this.buildObjectFields) {
      output.build[name] = input.build[name] ? input.build[name] : {};
    }
    for (let name of this.buildSingleFields) {
      output.build[name] = input.build[name] ? input.build[name] : null;
    }
    return output;
  }

  templateString(template, data) {
    return Mustache.render(template, data);
  }
}

module.exports = AbstractPlugin;