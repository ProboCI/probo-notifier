'use strict';

const request = require('request');
const yaml = require('js-yaml');

class PluginWithCredentials {

  constructor(config) {
    this.assets = config.assets;
  }

  /**
   * Gets the probo-credentials.yml file from assets receiver and parses the
   * file.
   *
   * @param {Object.<string, any>} project - The project object which includes
   *   its assets bucket.
   */
  _getConfig(project) {

    return new Promise((resolve, reject) => {

      request.get(`${this.assets.url}/asset/${project.assets.bucket}/probo-credentials.yml`, {
        'auth': {
          'bearer': this.assets.token,
        },
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        try {
          let config = yaml.safeLoad(body);

          return resolve(config);
        }
        catch (e) {
          return reject(e);
        }
      });

    });
  }

  /**
   * Replaces the variables in the message template.
   *
   * @param {string} template - The message template.
   * @param {Object.<string, any>} build - The build object from Kafka.
   *
   * @return {string} - The message with replaced variables.
   */
  _getMessage(template, build) {
    const variables = {
      '$PROJECT_NAME': build.project.name,
      '$BRANCH_NAME': build.branch.name,
      '$BRANCH_URL': build.branch.htmlUrl,
      '$BUILD_URL': build.links.build,
    };

    for (let varName in variables) {
      template = template.replace(varName, variables[varName]);
    }

    return template;
  }
}

module.exports = PluginWithCredentials;
