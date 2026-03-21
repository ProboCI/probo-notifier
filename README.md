# Probo Notifier

This project is a part of the [probo.ci](http://probo.ci) suite and is responsible
for sending notifications of build events to external services in the form of webhooks or
similar.

## Configuration

Add a `notifications` key to your `.probo.yaml` file to receive notifications
when build events occur, including steps completing and builds passing or failing.

### Webhook

The webhook plugin sends a POST request with build event data to the configured URL(s)
on every build event.

``` yaml
notifications:
  webhook: https://example.com/api/probo-notification
```

Multiple webhooks:

``` yaml
notifications:
  webhook:
    - https://example.com/api/probo-notification1
    - https://example.com/api/probo-notification2
```

#### Webhook Payload

The webhook POST body is a JSON object with the following structure:

``` json
{
  "event": "ready",
  "eventData": {},
  "image": "proboci/ubuntu-18.04-lamp:latest",
  "provider": "github",
  "repo": "awesome-drupal-project",
  "slug": "tizzo/awesome-drupal-project",
  "active": true,
  "name": "tizzo/awesome-drupal-project",
  "organizationId": "5560a4d5-a3cf-4099-bb1c-9e9abb51d417",
  "organization": "tizzo",
  "owner": "tizzo",
  "build": {
    "status": "running",
    "createdAt": "2016-06-15T03:45:08.431Z",
    "updatedAt": "2016-06-15T03:45:08.727Z",
    "reaped": false,
    "reapedReason": null,
    "projectId": "bee7244f-9b97-44e6-8952-951495b2e738",
    "pinned": null,
    "name": null,
    "id": "d571d17d-ce03-4689-9cf1-d829caebbb9a",
    "links": {
      "pullRequest": "http://bee7244f--pr-9.local.probo.build",
      "branch": "http://bee7244f--br-pr-to-close.local.probo.build",
      "build": "http://d571d17d.local.probo.build"
    },
    "pullRequest": {
      "description": "",
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/pull/9",
      "name": "Doing a simple build.",
      "number": "9"
    },
    "commit": {
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/commit/37ec694b",
      "ref": "37ec694b41ebe39e99f429e9f0eb67d7a63a7ec9"
    },
    "branch": {
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/tree/pr-to-close",
      "name": "pr-to-close"
    },
    "config": {},
    "container": {},
    "diskSpace": {
      "realBytes": 0,
      "virtualBytes": 0
    },
    "steps": []
  }
}
```

### Slack

The Slack plugin sends a message to one or more Slack channels when a build
completes (the `ready` event). It requires a Slack app with an incoming webhook URL.

#### Setup

1. Create a Slack app at https://api.slack.com/apps/new and add an incoming webhook.

2. For security, webhook URLs are not stored in `.probo.yaml`. Instead, upload a
   `probo-credentials.yml` [asset file](https://docs.probo.ci/build/assets/) containing
   the webhook URL(s):

``` yaml
notifications:
  slack:
    webhook:
      - https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

3. Enable Slack notifications in your `.probo.yaml`:

``` yaml
notifications:
  slack: true
```

Or with a custom message:

``` yaml
notifications:
  slack:
    message: "Build ready for `$PROJECT_NAME` on `$BRANCH_NAME` at $BUILD_URL"
```

#### Template Variables

The following variables can be used in custom Slack messages:

| Variable | Description |
|---|---|
| `$PROJECT_NAME` | The project name (e.g., `tizzo/awesome-drupal-project`) |
| `$BRANCH_NAME` | The branch name (e.g., `pr-to-close`) |
| `$BRANCH_URL` | URL to the branch on the provider |
| `$BUILD_URL` | URL to the Probo build environment |

### Jira

The Jira plugin automatically adds a comment to a Jira issue when a build
completes (the `ready` event). The issue is identified from the branch name — branches
must follow the format `PROJECTKEY-123/optional-description` (e.g., `DEV-42/add-login-page`).

#### Setup

1. Add Jira credentials to your `probo-credentials.yml`
   [asset file](https://docs.probo.ci/build/assets/):

``` yaml
notifications:
  jira:
    url: https://yourcompany.atlassian.net
    user: jira-user@example.com
    password: your-api-token
```

2. Enable Jira notifications in your `.probo.yaml`:

``` yaml
notifications:
  jira: true
```

Or with a custom message:

``` yaml
notifications:
  jira:
    message: "Probo build ready for $PROJECT_NAME on branch $BRANCH_NAME: $BUILD_URL"
```

#### How It Works

When a build completes, the plugin extracts the Jira issue ID from the branch name
using the pattern `PROJECTKEY-NUMBER` (e.g., `DEV-42`). It then posts a comment to
that issue via the Jira REST API (`/rest/api/2/issue/{issueId}/comment`).

If the branch name does not match the expected pattern, no comment is posted.

#### Template Variables

| Variable | Description |
|---|---|
| `$PROJECT_NAME` | The project name (e.g., `tizzo/awesome-drupal-project`) |
| `$BRANCH_NAME` | The branch name (e.g., `DEV-42/add-login-page`) |
| `$BRANCH_URL` | URL to the branch on the provider |
| `$BUILD_URL` | URL to the Probo build environment |
