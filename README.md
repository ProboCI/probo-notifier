# Probo Notifier

A microservice in the [ProboCI](http://probo.ci) suite that consumes build events from a Kafka event bus and dispatches notifications (webhooks) to external services.

## Configuration

Add a `notifications` key to your `.probo.yaml` file to receive webhooks when build events occur, including steps completing, builds passing, or builds failing.

### Single webhook

``` yaml
notifications:
  webhook: https://example.com/api/probo-notification
```

### Multiple webhooks

``` yaml
notifications:
  webhook:
    - https://example.com/api/probo-notification1
    - https://example.com/api/probo-notification2
```

### Object format

``` yaml
notifications:
  webhook:
    url: https://example.com/api/probo-notification
```

## Webhook Payload

The webhook is sent as a JSON POST request. The payload is a sanitized subset of the internal build event — sensitive fields like auth tokens and internal metrics are stripped out.

### Top-level fields

| Field | Type | Description |
|---|---|---|
| `event` | string | The event that triggered the notification (e.g., `"ready"`) |
| `eventData` | object | Additional data associated with the event |
| `image` | string | The Docker image configured for the build |
| `provider` | string | The source control provider slug (e.g., `"github"`) |
| `repo` | string | The repository name |
| `slug` | string | The full repository slug (e.g., `"owner/repo"`) |
| `active` | boolean | Whether the project is active |
| `name` | string | The full project name (e.g., `"owner/repo"`) |
| `organizationId` | string | The organization UUID |
| `organization` | string | The organization name (parsed from the project name) |
| `owner` | string | The repository owner |

### `build` fields

| Field | Type | Description |
|---|---|---|
| `build.id` | string | The build UUID |
| `build.status` | string | The current build status |
| `build.name` | string | The build name |
| `build.createdAt` | string | ISO 8601 timestamp of build creation |
| `build.updatedAt` | string | ISO 8601 timestamp of last update |
| `build.projectId` | string | The project UUID |
| `build.pinned` | boolean | Whether the build is pinned |
| `build.reaped` | boolean | Whether the build has been reaped |
| `build.reapedReason` | string | Reason the build was reaped, if applicable |
| `build.links` | object | URLs for the build, pull request, and branch environments |
| `build.pullRequest` | object | Pull request details (`name`, `number`, `description`, `htmlUrl`) |
| `build.commit` | object | Commit details (`ref`, `htmlUrl`) |
| `build.branch` | object | Branch details (`name`, `htmlUrl`) |
| `build.config` | object | The build configuration from `.probo.yaml` |
| `build.container` | object | Container information |
| `build.diskSpace` | object | Disk space usage (`realBytes`, `virtualBytes`) |
| `build.steps` | array | Build step definitions and their statuses |

### Example payload

```json
{
  "event": "ready",
  "eventData": null,
  "image": "proboci/ubuntu-18.04-lamp",
  "provider": "github",
  "repo": "awesome-drupal-project",
  "slug": "tizzo/awesome-drupal-project",
  "active": true,
  "name": "tizzo/awesome-drupal-project",
  "organizationId": "5560a4d5-a3cf-4099-bb1c-9e9abb51d417",
  "organization": "tizzo",
  "owner": "tizzo",
  "build": {
    "id": "d571d17d-ce03-4689-9cf1-d829caebbb9a",
    "status": "running",
    "name": null,
    "createdAt": "2016-06-15T03:45:08.431Z",
    "updatedAt": "2016-06-15T03:45:08.727Z",
    "projectId": "bee7244f-9b97-44e6-8952-951495b2e738",
    "pinned": null,
    "reaped": false,
    "reapedReason": null,
    "links": {
      "pullRequest": "http://bee7244f-9b97-44e6-8952-951495b2e738--pr-9.local.probo.build",
      "branch": "http://bee7244f-9b97-44e6-8952-951495b2e738--br-pr-to-close.local.probo.build",
      "build": "http://d571d17d-ce03-4689-9cf1-d829caebbb9a.local.probo.build"
    },
    "pullRequest": {
      "description": "",
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/pull/9",
      "name": "Doing a simple build.",
      "number": "9"
    },
    "commit": {
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/commit/37ec694b41ebe39e99f429e9f0eb67d7a63a7ec9",
      "ref": "37ec694b41ebe39e99f429e9f0eb67d7a63a7ec9"
    },
    "branch": {
      "htmlUrl": "https://github.com/tizzo/awesome-drupal-project/tree/pr-to-close",
      "name": "pr-to-close"
    },
    "config": {
      "steps": [
        {
          "name": "Sleep and setup a docroot",
          "plugin": "Script",
          "script": "sleep 15\nmkdir -p /var/www/html\n"
        }
      ],
      "notifications": {
        "webhook": "https://example.com/api/probo-notification"
      }
    },
    "container": {},
    "diskSpace": {
      "realBytes": 0,
      "virtualBytes": 0
    },
    "steps": []
  }
}
```

## Development

### Prerequisites

- Node.js 22
- npm

### Setup

```bash
npm install
```

### Running the server

```bash
./bin/probo-notifier
```

Configuration is loaded in order from:

1. `default.yaml` (bundled defaults)
2. `/etc/probo/notifier.yaml`
3. `/etc/probo/notifier.d/` (directory of YAML files)
4. `~/.probo-notifier.yaml`

### Running tests

```bash
npm test
```

### Linting

```bash
npx eslint .
```

## Docker

```bash
./build.sh <repository_name> <tag>
```

For example:

```bash
./build.sh mbagnall dev
```

The image is based on `node:22-alpine` and exposes port **3039**.

## License

Apache-2.0
