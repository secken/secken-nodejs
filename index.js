var Q = require("q");
var _ = require("lodash");
var request = require("request");
var crypto = require("crypto");
var punycode = require('punycode');
var querystring = require("querystring");

var Secken = function(options) {
    this.appId = options.appId;
    this.appKey = options.appKey;
    this.authId = options.authId;

    this.url = options.url || "https://api.yangcong.com/v2/";
    this.authUrl = options.authUrl || "https://auth.yangcong.com/v2/auth_page";
};

Secken.prototype.breakQ = function() {
    return Q.defer().promise;
};

Secken.prototype.md5 = function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
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

    return this.md5(string);
};

Secken.prototype.formatation = function(data) {
    return _.transform(data, function(result, v, k) {
        switch (k) {
            case 'username':
                result[k] = encodeURIComponent(v);
                break;
            case 'callback':
                result[k] = encodeURIComponent(v);
                break;
            default:
                result[k] = v;
        }
    });
};

Secken.prototype.getResult = function(event_id, time) {
    var _self = this;

    var once = time === false ? true : false;
    var time = time || 2000;
    var defer = Q.defer();

    var params = {
        app_id: this.appId,
        event_id: event_id,
    };

    params = this.formatation(params);

    params.signature = this.getSignature(params);

    var loop = function() {
        request({
            method: "GET",
            baseUrl: _self.url,
            uri: "/event_result",
            qs: params,
        }, function(error, response, body) {
            var data = JSON.parse(body);

            switch(data.status) {
                case 200:
                    if( data.signature === _self.getSignature(data) ) {
                        defer.resolve(data);
                    } else {
                        defer.reject(data);
                    }
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
};

Secken.prototype.getQrcode = function(type, options) {
    var _self = this;

    var url = type == "bind" ? "qrcode_for_binding" : "qrcode_for_auth";

    var options = options || {};

    var defer = Q.defer();

    var params = {
        app_id: this.appId,
    };

    if(options.auth_type) params.auth_type = options.auth_type;
    if(options.callback) params.callback = options.callback;

    params = this.formatation(params);

    params.signature = this.getSignature(params);

    request({
        method: "GET",
        baseUrl: _self.url,
        uri: url,
        qs: params,
    }, function(error, response, body) {
        var data = JSON.parse(body);

        switch(data.status) {
            case 200:
                if( data.signature === _self.getSignature(data) ) {
                    defer.resolve(data);
                } else {
                    defer.reject(data);
                }
                break;
            default:
                defer.reject(data);
        }

    });

    return defer.promise;
};

Secken.prototype.getAuth = function(options) {
    return this.getQrcode("auth", options);
};

Secken.prototype.getBind = function(options) {
    return this.getQrcode("bind", options);
};

Secken.prototype.realtimeAuth = function(options) {
    var _self = this;

    var defer = Q.defer();

    var params = {
        action_type: options.action_type,
        app_id: this.appId,
        auth_type: options.auth_type,
        uid: options.uid,
    };

    if(options.user_ip) params.user_ip = options.user_ip;
    if(options.username) params.username = options.username;
    if(options.callback) params.callback = options.callback;

    params = this.formatation(params);

    params.signature = this.getSignature(params);

    request({
        method: "POST",
        baseUrl: _self.url,
        uri: "/realtime_authorization",
        form: params,
    }, function(error, response, body) {
        var data = JSON.parse(body);

        switch(data.status) {
            case 200:
                if( data.signature === _self.getSignature(data) ) {
                    defer.resolve(data);
                } else {
                    defer.reject(data);
                }
                break;
            default:
                defer.reject(data);
        }
    });

    return defer.promise;
};

Secken.prototype.offlineAuth = function(options) {
    var _self = this;

    var defer = Q.defer();

    var params = {
        app_id: this.appId,
        dynamic_code: options.dynamic_code,
        uid: options.uid,
    };

    params = this.formatation(params);

    params.signature = this.getSignature(params);

    request({
        method: "POST",
        baseUrl: _self.url,
        uri: "/offline_authorization",
        form: params,
    }, function(error, response, body) {
        var data = JSON.parse(body);

        switch(data.status) {
            case 200:
                if( data.signature === _self.getSignature(data) ) {
                    defer.resolve(data);
                } else {
                    defer.reject(data);
                }
                break;
            default:
                defer.reject(data);
        }
    });

    return defer.promise;
};

Secken.prototype.authPage = function(callback) {
    var params = {
        auth_id: this.authId,
        callback: callback,
        timestamp: new Date().getTime()
    };

    params = this.formatation(params);

    params.signature = this.getSignature(params);

    return this.authUrl + "?" + querystring.stringify(params);
};

module.exports = Secken;
