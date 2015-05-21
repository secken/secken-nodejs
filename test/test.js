var assert = require("assert");
var Secken = require("../index.js");

describe("Secken", function() {
    var sk = new Secken({
        appId: " ",
        appKey: " ",
        authId: " "
    });

    describe("#getSignature()", function() {
        it("should return a string", function() {
            assert.equal("string", typeof(sk.getSignature({aaa:"bbb"})));
        });
    });

    describe("#getResult()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });

    describe("#getAuth()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });

    describe("#getBind()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });

    describe("#realtimeAuth()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });

    describe("#offlineAuth()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });

    describe("#getAuthPage()", function() {
        it("should exec without error", function(done) {
            done();
        });
    });
});
