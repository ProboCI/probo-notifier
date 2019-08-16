'use strict';

const request = require('request');

const PluginWithCredentials = require('./PluginWithCredentials');

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
class Slack extends PluginWithCredentials {

  constructor(notification, config) {

    super(config);

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

    const message = {
      text: this._getMessage(this.message, build),
    };

    config.webhook.forEach(webhook => {
      request.post({url: webhook, json: message}, (err, res, body) => {
        if (err || body === 'invalid_payload') {
          console.log('Error submitting message to Slack', err, body);

          return;
        }

        console.log('Message sent to Slack.');
      });
    });
  }

}

module.exports = Slack;
