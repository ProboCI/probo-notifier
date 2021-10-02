'use strict';

const Mustache = require('mustache');
const logger = require('../logger').get();

class AbstractPlugin {

  constructor() {
    if (this.constructor === AbstractPlugin) {
      throw new Error('Can\'t instantiate abstract class!');
    }
    this.buildArrayFields = [
      'steps',
    ];
    this.buildObjectFields = [
      'links',
      'pullRequest',
      'commit',
      'config',
      'container',
      'branch',
      'diskSpace',
      'steps',
    ];
    this.buildSingleFields = [
      'status',
      'createdAt',
      'updatedAt',
      'reaped',
      'reapedReason',
      'projectId',
      'pinned',
      'name',
      'id',
    ];
  }

  prepareObject(input) {
    // To get the full object from which we can pull from, uncomment
    // the line below.
    // logger.error({input: input});

    var output = {
      build: {},
      // TODO: Update this
      event: '',
    };

    for (let name of this.buildObjectFields) {
      output.build[name] = input.build[name] ? input.build[name] : {};
    }
    for (let name of this.buildArrayFields) {
      output.build[name] = input.build[name] ? input.build[name] : [];
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
