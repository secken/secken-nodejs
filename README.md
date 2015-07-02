# Secken SDK for Javascript

## Install
```sh
npm install secken-api
```
## Usage


### require && config

```javascript
var Secken = require("secken-api");

var sk = new Secken({
    appId: "",
    appKey: "",
    appSecret: ""
});
```
After initialization, Secken-api can help you to develop you project.
Most of Secken-api's functions will return a promise object which using `q`, then you can use the primose object embed into you project.

### Get Bind Qrcode Image Url
```javascript
sk.getBind({
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
    action_type: " action ",
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

## Secken Team
[Secken](https://www.secken.com)
