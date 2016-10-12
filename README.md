# Probo Notifier

This project is a part of the [probo.ci](http://probo.ci) suite and is responsible
for sending notifications of build events to external in the form of webhooks or
similar.

## The configuration

You can add notifications to your build simply by adding a `notifications` key to your
`.probo.yaml` file. This will allow you to start getting webhooks delivered to your
service when changes happend to your builds including steps completing and builds passing
or failing.


Simple examples:

``` yaml
notifications:
  webhook: https://example.com/api/probo-notification
  
```

``` yaml

notifications:
  webhook:
    - https://example.com/api/probo-notification1
    - https://example.com/api/probo-notification2
```
