'use strict';

const request = require('request');
const yaml = require('js-yaml');

const EVENT_READY = 'ready';

const DEFAULT_MESSAGE = 'New Probo build for project `$PROJECT_NAME`' +
 'on branch `$BRANCH_NAME` at $BUILD_URL';

  /**
   * Defines a notifier plugin for Slack.
   *
   * To use, create a Slack Webhook URL. Get one by creating a Slack app
   * https://api.slack.com/apps/new and adding a webhook to it.
   *  - For increased security, pass the webook URL via asset file instead
   *  - Include a probo-credentials.yml assets file
   *    https://docs.probo.ci/build/assets/ which contains e.g.:
   *
   *    notifications:
   *      slack:
   *        webhook:
   *          - https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   */
class Slack {

  constructor(notification, config) {

    switch (typeof notification) {
      case 'boolean':
        this.enabled = notification;
        this.message = DEFAULT_MESSAGE;
        break;
      case 'object':
        this.enabled = true;
        this.message = notification.message || DEFAULT_MESSAGE;
        break;
      default:
        this.enabled = false;
    }

    this.assets = config.assets;

    this.send = this.send.bind(this);
  }

  send(data) {
    // Only if Slack notifications are enabled and the received event is for
    // a completed build ('ready' event).
    if (this.enabled && data.event === EVENT_READY) {
      this._process(data.build);
    }

    return;
  }

  /**
   * Sends information on the created build to each Slack webhook.
   *
   * @param {Object.<string, any>} build - The build object coming from Kafka.
   */
  async _process(build) {
    let config = await this._getConfig(build.project).catch(err => console.log(err));
    config = config.notifications.slack;

    const variables = {
      '$PROJECT_NAME': build.project.name,
      '$BRANCH_NAME': build.branch.name,
      '$BUILD_URL': build.links.build,
    };

    let text = this.message;
    for (let varName in variables) {
      text = text.replace(varName, variables[varName]);
    }

    const message = {
      text: text,
    };

    config.webhook.forEach(webhook => {
      request.post({url: webhook, json: message}, (err, res, body) => {
        if (err || body === 'invalid_payload') {
          console.log('Error submitting message to Slack', err, body);
        }

        console.log('Message sent to Slack.');
      });
    });
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

}

module.exports = Slack;
