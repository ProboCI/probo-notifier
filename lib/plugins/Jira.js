'use strict';

const request = require('request');

const PluginWithCredentials = require('./PluginWithCredentials');

const EVENT_READY = 'ready';

class Jira extends PluginWithCredentials {

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
    if (data.event === EVENT_READY) {
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
    config = config.notifications.jira;

    const issue = this._getIssue(build.branch.name);

    if (issue) {
      const url = `${config.url}/rest/api/2/issue/${issue}/comment`;
      const comment = {
        body: this._getMessage(this.message, build),
      };
      const auth = {
        username: config.user,
        pass: config.password,
      };

      request.post({url: url, json: comment, auth: auth}, (err, res, body) => {
        if (err || body.errorMessages) {
          console.log('Failed to add comment to Jira', err, body);

          return;
        }

        console.log(`Comment sent to Jira issue ${config.url}/browse/${issue}`);
      });
    }
  }

  _getIssue(branchName) {
    const regex = /^([aA-zZ]+)-([0-9]+)/;

    return regex.exec(branchName)[0];
  }

}

module.exports = Jira;
