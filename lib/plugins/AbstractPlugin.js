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

    const organizationName = input.build.project.name.split("/")[0];

    var output = {
      build: {},
      event: input.event,
      eventData: input.data,
      image: input.build.config.image,
      provider: input.build.project.provider.slug,
      repo: input.build.project.repo,
      slug: input.build.project.slug,
      active: input.build.project.active,
      name: input.build.project.name,
      organizationId: input.build.project.organizationId,
      organization: organizationName,
      owner: input.build.project.owner,
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
