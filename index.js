var Q = require("q");
var _ = require("lodash");
var request = require("request");
var SparkMD5 = require("spark-md5");
var querystring = require("querystring");

var Secken = function(options) {
    this.appId = options.appId;
    this.appKey = options.appKey;
    this.appSecret = options.appSecret;
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

Secken.prototype.getResult = function(event_id, time, defer) {
    var time = time || 2000;
    var D = defer || Q.defer();

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
                    setTimeout(loop, time);
                    defer.notify(data);
                    break;
                default:
                    defer.reject(data);
            }
        });
    };

    loop();

    return defer;
}

Secken.prototype.getQrcode = function(type, success, error, time) {

    var url = type == "bind" ? "qrcode_for_binding" : "qrcode_for_auth";

    var error = error || function(){};
    var _this = this;
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
                success(data);
                if(time !== false) {
                    _this.getResult(data.event_id, (time || 1000), defer);
                }
                break;
            default:
                error(data);
        }

    });

    return defer.promise;
};

Secken.prototype.getAuth = function(success, error, time) {
    return this.getQrcode("auth", success, error, time);
};

Secken.prototype.getBind = function(success, error, time) {
    return this.getQrcode("bind", success, error, time);
};

Secken.prototype.realtimeAuth = function(options, success, error, time) {

    var error = error || function(){};
    var _this = this;
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
                success(data);
                if(time !== false) {
                    _this.getResult(data.event_id, (time || 1000), defer);
                }
                break;
            default:
                error(data);
        }
    });

    return defer.promise;
};

Secken.prototype.offlineAuth = function(options, success, error) {
    var error = error || function() {};

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
                success(data);
                break;
            default:
                error(data);
        }
    });
};

/*Secken.prototype.test = function(step1, step2) {
    var defer = Q.defer();

    var resolve = defer.resolve;

    function _resolve(step2) {

        var defer2 = Q.defer();

        resolve();

        step2 ? defer2.resolve() : defer2.reject();

        return defer2.promise;
    }

    defer.resolve = _resolve;

    step1 ? defer.resolve() : defer.reject();

    return defer.promise;
}*/

module.exports = Secken;
