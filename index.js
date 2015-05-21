var Q = require("q");
var _ = require("lodash");
var request = require("request");
var SparkMD5 = require("spark-md5");
var querystring = require("querystring");

var Secken = function(options) {
    this.appId = options.appId;
    this.appKey = options.appKey;
    this.authId = options.authId;
};

Secken.prototype.getSignature = function(data, ignore) {
    var ignore = ignore || [];
    ignore = _.union(ignore, ["signature"]);

    var keys = _.keys(data);
    keys = _.sortBy(_.difference(keys, ignore));

    var string = "";
    _.forEach(keys, function(key) {
        string += key + "=" + data[key];
    });

    string += this.appKey;

    return SparkMD5.hash(string);
};

Secken.prototype.getResult = function(event_id, time) {
    var once = time === false ? true : false;
    var time = time || 2000;
    var defer = Q.defer();

    var params = {
        app_id: this.appId,
        event_id: event_id,
    };

    params.signature = this.getSignature(params);

    var loop = function() {
        request({
            method: "GET",
            uri: "https://api.yangcong.com/v2/event_result",
            qs: params,
        }, function(error, response, body) {
            var data = JSON.parse(body);
            switch(data.status) {
                case 200:
                    defer.resolve(data);
                    break;
                case 602:
                    if(!once) setTimeout(loop, time);
                    defer.notify(data);
                    break;
                default:
                    defer.reject(data);
            }
        });
    };

    loop();

    return defer.promise;
}

Secken.prototype.getQrcode = function(type) {

    var url = type == "bind" ? "qrcode_for_binding" : "qrcode_for_auth";

    var defer = Q.defer();
    var data = {
        app_id: this.appId,
    };

    data.signature = this.getSignature(data);

    request({
        method: "GET",
        uri: "https://api.yangcong.com/v2/"+url,
        qs: data,
    }, function(error, response, body) {
        var data = JSON.parse(body);
        switch(data.status) {
            case 200:
                defer.resolve(data);
                break;
            default:
                defer.reject(data);
        }

    });

    return defer.promise;
};

Secken.prototype.getAuth = function() {
    return this.getQrcode("auth");
};

Secken.prototype.getBind = function() {
    return this.getQrcode("bind");
};

Secken.prototype.realtimeAuth = function(options) {
    var defer = Q.defer();

    var data = {
        action_type: options.action_type,
        app_id: this.appId,
        uid: options.uid,
    };

    data.signature = this.getSignature(data);

    if(options.user_ip) data.user_ip = options.user_ip;
    if(options.username) data.username = options.username;

    request({
        method: "POST",
        uri: "https://api.yangcong.com/v2/realtime_authorization",
        form: data,
    }, function(error, response, body) {
        var data = JSON.parse(body);
        switch(data.status) {
            case 200:
                defer.resolve(data);
                break;
            default:
                defer.reject(data);
        }
    });

    return defer.promise;
};

Secken.prototype.offlineAuth = function(options) {
    var defer = Q.defer();

    var data = {
        app_id: this.appId,
        dynamic_code: options.dynamic_code,
        uid: options.uid,
    };

    data.signature = this.getSignature(data);

    request({
        method: "POST",
        uri: "https://api.yangcong.com/v2/offline_authorization",
        form: data,
    }, function(error, response, body) {
        var data = JSON.parse(body);

        switch(data.status) {
            case 200:
                defer.resolve(data);
                break;
            default:
                defer.reject(data);
        }
    });

    return defer.promise;
};

Secken.prototype.getAuthPage = function(callback) {
    var data = {
        auth_id: this.authId,
        callback: callback,
        timestamp: new Date().getTime()
    };

    data.signature = this.getSignature(data);

    return "https://auth.yangcong.com/v2/auth_page?" + querystring.stringify(data);
};

module.exports = Secken;
