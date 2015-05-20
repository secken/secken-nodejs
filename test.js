var Secken = require("./index.js");

var sk = new Secken({
    appId: " ",
    appKey: " ",
    authId: " "
});

sk.getBind()
.then(function(result) {
    var qrcodeURL = result.qrcode_url;
    console.log("this is qrcode:", qrcodeURL);
    return sk.getResult(result.event_id);
}, function(result) {
    var errorCode = result.status;

    // do some things

}).then(success, failed, notify);


sk.realtimeAuth({
    action_type: "login",
    uid: "  ",
}).then(function(data) {
    console.log(data);
    return sk.getResult(data.event_id);
}).then(success, failed, notify);



function success(data) {
    console.log("Auth Successed");
    console.log(data);
}

function failed(data) {
    console.log("Auth Failed");
    console.log(data);
}

function notify(data) {
    console.log("Waiting for Conform");
    console.log(data.description);
}
