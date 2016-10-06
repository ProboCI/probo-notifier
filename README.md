# Probo Notifier

This project is a part of the [probo.ci](http://probo.ci) suite and is responsible
for sending notifications of build events to external in the form of webhooks or
similar.

## The configuration

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
