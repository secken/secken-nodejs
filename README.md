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
After initialization, Secken-api can help you to complete you project.
Secken-api's most functions will return a promise used `q`, so you can use the primose funtion to code you project.

### Get Bind
```javascript
sk.getBind()
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

}).then(success, failed, notify);
```

### Auth
```javascript
sk.getAuth()
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
this function will repeat get result, default delay time is `1000` ms, you can pass `time` to set the delay time, and you can use the primose `notify` function to get each response.
If you pass `false` as the value of time, it will run only once.

### Offline Auth
```javascript
sk.realtimeAuth({
    dynamic_code: " code ",
    uid: " user id ",
}).then(function(data) {
    // Success

    // do some things

}, function(data) {});
```

### Get Signature
`getSignature(params [,ignore])`, pass a object type value for `params` and a array type value for `ignore`.
you can use this function to get a signature string of a params object.

```javascript
var signature = sk.getSignature(params, ['user_ip', 'username']);
```

## Secken Team
[Secken](https://www.secken.com)
