'use strict';

const eventbus = require('probo-eventbus');

const logger = require('./logger').get();

class EventConsumer {
  constructor(config) {
    this.config = config;
    this.topic = config.consumerTopic || config.topic;
  }

  async start() {
    try {
      this._consumer = new eventbus.plugins[this.config.plugin].Consumer(this.config);

      if (typeof this._consumer.onError === 'function') {
        this._consumer.onError(err => {
          logger.error({err: err}, 'Consumer error');
        });
      }

      await this._consumer.start();
    }
    catch (err) {
      logger.error({err: err}, `Failed to instantiate build stream consumer plugin: ${err.message}`);
      throw err;
    }
  }

  onMessage(listener) {
    this._consumer.onMessage(listener);
  }

  async commit() {
    try {
      await this._consumer.commit();
    }
    catch (err) {
      logger.error({err: err}, 'Error committing offset');
    }
  }

  destroy(cb) {
    this._consumer.destroy(cb);
  }
}

module.exports = EventConsumer;
