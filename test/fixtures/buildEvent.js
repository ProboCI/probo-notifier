'use strict';

var _ = require('lodash');

function getTestBuildEvent(object) {
  object = object || {};
  var baseline = {
    commit: {
      htmlUrl: 'https://github.com/tizzo/awesome-drupal-project/commit/37ec694b41ebe39e99f429e9f0eb67d7a63a7ec9',
      ref: '37ec694b41ebe39e99f429e9f0eb67d7a63a7ec9',
    },
    pullRequest: {
      description: '',
      htmlUrl: 'https://github.com/tizzo/awesome-drupal-project/pull/9',
      name: 'Doing a simple build.',
      number: '9',
    },
    branch: {
      htmlUrl: 'https://github.com/tizzo/awesome-drupal-project/tree/pr-to-close',
      name: 'pr-to-close',
    },
    config: {
      steps: [
        {
          name: 'Sleep and setup a docroot',
          plugin: 'Script',
          script: 'sleep 15\nmkdir -p /var/www/html\necho \'<h1>This is a build</h1>\' > /var/www/html/index.html\nchmod 777 -R /var/www\n',
          tty: false,
        },
      ],
      notifications: {
        test: true,
      },
    },
    reaped: false,
    statuses: {},
    submittedState: 'pending',
    diskSpace: {
      realBytes: 0,
      virtualBytes: 0,
    },
    createdAt: '2016-06-15T03:45:08.431Z',
    projectId: 'bee7244f-9b97-44e6-8952-951495b2e738',
    project: {
      active: true,
      assets: {
        bucket: 'bee7244f-9b97-44e6-8952-951495b2e738',
        tokens: ['8e015a2d-8c29-43bc-b458-63cbeb4e6b8b'],
      },
      createdAt: '2016-03-22T21: 20:38.516Z',
      id: 'bee7244f-9b97-44e6-8952-951495b2e738',
      metrics: {
        builds: {
          count: 0,
          diskSpace: {
            realBytes: 0,
            realBytesAvg: 0,
          },
          duration: {
            milliseconds: 0,
            millisecondsAvg: 0,
          },
        },
      },
      name: 'tizzo/awesome-drupal-project',
      organizationId: '5560a4d5-a3cf-4099-bb1c-9e9abb51d417',
      owner: 'tizzo',
      provider: {
        slug: 'github',
        type: 'github',
      },
      provider_id: 32553629,
      repo: 'awesome-drupal-project',
      repoId: 'f0163fd7-4868-40f8-adcb-fdd959e27f79',
      service_auth: {
        token: '2a79909fd6f3119a64a52786d3c33e0f39fafd10',
      },
      slug: 'tizzo/awesome-drupal-project',
      updatedAt: '2016-06-07T18: 28: 30.003Z',
      organization: {
        id: '5560a4d5-a3cf-4099-bb1c-9e9abb51d417',
        subscription: {
          rules: {
            concurrentBuilds: 1,
            diskSpace: 1,
            providerOrgs: 1,
          },
        },
      },
    },
    updatedAt: '2016-06-15T03:45:08.727Z',
    requestId: 'f1ccc625-43cf-4b48-a2de-bfe357a94fc8',
    id: 'd571d17d-ce03-4689-9cf1-d829caebbb9a',
    links: {
      pullRequest: 'http://bee7244f-9b97-44e6-8952-951495b2e738--pr-9.local.probo.build',
      branch: 'http://bee7244f-9b97-44e6-8952-951495b2e738--br-pr-to-close.local.probo.build',
      build: 'http://d571d17d-ce03-4689-9cf1-d829caebbb9a.local.probo.build',
    },
    active: true,
  };
  return {build: _.merge(baseline, object), event: 'ready'};
}
module.exports = getTestBuildEvent;
