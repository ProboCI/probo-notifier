# Probo Notifier

This project is a part of the [probo.ci](http://probo.ci) suite and is responsible
for sending notifications of build events to external in the form of webhooks or
similar.

## The configuration

Simple examples:

``` yaml
notifications:
  webhook: https://example.com/api/travis-notification
  slack: '<account>:<token>#development'
  hipchat: '<token>@<room id or name>'
  
```

``` yaml

notifications:
  webhook: https://example.com/api/travis-notification
  slack: '<account>:<token>#development'
```

## The schema

```` json
{
}
````
