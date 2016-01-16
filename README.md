# Secken SDK for Javascript

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Install
```sh
npm install secken-api
```
## Usage


### require && config

```javascript
var Secken = require("secken-api");

var sk = new Secken({
    app_id: "",
    app_key: "",
    auth_id: ""
});
```
After initialization, Secken-api can help you to develop you project.
Most of Secken-api's functions will return a promise object which using `q`, then you can use the primose object embed into you project.

### Get Bind Qrcode Image Url
```javascript
sk.getBind({
    auth_type: 2,
    callback: "http://www.callback/path"
})
.then(function(result) {
    // Success
    var qrcodeURL = result.qrcode_url;
    console.log("this is qrcode:", qrcodeURL);
    // do some things

    return sk.getResult(result.event_id);
}, function(result) {
    // Failed
    var errorCode = result.status;

    // do some things

    return sk.breakQ();
}).then(success, failed, notify);
```

### Get Auth Qrcode Image Url
```javascript
sk.getAuth({
    auth_type: 3,
    callback: "http://www.callback/path"
})
.then(function(result) {
    // Success
    var qrcodeURL = result.qrcode_url;
    console.log("this is qrcode:", qrcodeURL);
    // do some things

    return sk.getResult(result.event_id);
}, function(result) {
    // Failed
    var errorCode = result.status;

    // do some things

    return sk.breakQ();
}).then(success, failed, notify);
```

### Realtime Auth
```javascript
sk.realtimeAuth({
    action_type: 1,
    uid: " user id ",
}).then(function(data) {
    // Success

    // do some things

    return sk.getResult(data.event_id);
}, function(data) {
    return sk.breakQ();
}).then(success, failed, notify);
```

### Get Result
```javascript
sk.getResult(event_id, time)
.then(function(data) {
    // Success
    console.log(data);

    // do some things
}, function(data) {
    // Failed

});
```
This function will repeat getting result, the default delay time is `1000` ms, you can use parameter `time` to set the delay time, and you can use the primose's `notify` function to get each response.
If you pass `false` as the value of `time`, it will run only once.

### Offline Auth
```javascript
sk.offlineAuth({
    dynamic_code: " code ",
    uid: " user id ",
}).then(function(data) {
    // Success

    // do some things

}, function(data) {});
```

### Get Auth Page Url
```javascript
var url = sk.authPage( " callback url " );
```

### Get Signature
`getSignature(params [,ignore])`, pass an object type value for `params` and an array type value for `ignore`.
You can use this function to get the signature string of a params object.

```javascript
var signature = sk.getSignature(params, ['user_ip', 'username']);
```

## Change log

#### 2.0.4
* use ES6
* change init params' key
* add `request()` function
* update `request` to 2.67.0

## Secken Team
[Secken](https://www.secken.com)


[npm-image]: https://img.shields.io/npm/v/secken-api.svg?style=flat-square
[npm-url]: https://npmjs.org/package/secken-api
[downloads-image]: http://img.shields.io/npm/dm/secken-api.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/secken-api
[travis-image]: https://img.shields.io/travis/secken/secken-nodejs.svg?style=flat-square
[travis-url]: https://travis-ci.org/secken/secken-nodejs
