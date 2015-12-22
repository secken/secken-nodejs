"use strict"

let Q = require("q");
let _ = require("lodash");
let request = require("request");
let crypto = require("crypto");
let querystring = require("querystring");

class Secken {
    constructor(options) {
        this.app_id = options.app_id;
        this.app_key = options.app_key;
        this.auth_id = options.auth_id;

        this.url = options.url || "https://api.yangcong.com/v2/";
        this.auth_url = options.auth_url || "https://auth.yangcong.com/v2/auth_page";
    }

    breakQ() {
        return Q.defer().promise;
    }

    md5(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    getSignature(data, ignore) {
        ignore = ignore || [];
        ignore = _.union(ignore, ["signature"]);

        let keys = _.keys(data);
        keys = _.sortBy(_.difference(keys, ignore));

        let string = "";
        _.forEach(keys, key => {
            string += key + "=" + data[key];
        });

        string += this.app_key;

        return this.md5(string);
    }

    formatation(data) {
        return _.transform(data, (result, v, k) => {
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
    }

    request(uri, params, method, base_url) {
        params = this.formatation(params);
        params.signature = this.getSignature(params);

        let options = {
            method: method || "GET",
            baseUrl: base_url || this.url,
            uri: uri || "qrcode_for_auth",
            qs: params || {}
        };

        let _self = this;
        let defer = Q.defer();

        request(options, (error, response, body) => {
            let data = JSON.parse(body);

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
    }

    getResult(event_id, time) {
        let once = time === false ? true : false;
        time = time || 2000;

        let params = {
            app_id: this.app_id,
            event_id: event_id,
        };

        let _self = this;
        let defer = Q.defer();

        var loop = function() {
            _self.request("event_result", params).then(data => {
                defer.resolve(data);
            }, error => {
                if(error.status == 602) {
                    if(!once) setTimeout(loop, time);
                    defer.notify(error);
                } else {
                    defer.reject(error);
                }
            });
        };

        loop();

        return defer.promise;
    }

    getQrcode(type, options) {
        let url = type == "bind" ? "qrcode_for_binding" : "qrcode_for_auth";

        options = options || {};

        let params = {
            app_id: this.app_id,
        };

        if(options.auth_type) params.auth_type = options.auth_type;
        if(options.callback) params.callback = options.callback;

        return this.request(url, params);
    }

    getAuth(options) {
        return this.getQrcode("auth", options);
    }

    getBind(options) {
        return this.getQrcode("bind", options);
    }

    realtimeAuth(options) {
        let params = {
            action_type: options.action_type,
            app_id: this.app_id,
            auth_type: options.auth_type,
            uid: options.uid,
        };

        if(options.user_ip) params.user_ip = options.user_ip;
        if(options.username) params.username = options.username;
        if(options.callback) params.callback = options.callback;

        return this.request("realtime_authorization", params, "POST");
    }

    offlineAuth(options) {
        let params = {
            app_id: this.app_id,
            dynamic_code: options.dynamic_code,
            uid: options.uid,
        };

        return this.request("offline_authorization", params, "POST");
    }

    authPage(callback) {
        let params = {
            auth_id: this.auth_id,
            callback: callback,
            timestamp: new Date().getTime()
        };

        params = this.formatation(params);
        params.signature = this.getSignature(params);

        return this.auth_url + "?" + querystring.stringify(params);
    }
}

module.exports = Secken;
