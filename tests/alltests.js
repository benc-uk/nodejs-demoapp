var expect    = require('chai').expect;
//var server = require('../server');
const request = require('request');
const exec    = require('child_process');

// after(function (done) {
//   exec.execSync("pkill -f -x 'node server.js'");
//   done();
// });

describe("Dummy Test", function() {
  describe("This is a test", function() {
    it("checks nothing", function() {
      var value   = "this is stupid"
      expect(value).to.equal("this is stupid");
    });
  });
});

describe("Main app routes", function() {
  describe("Check /home URL", function() {
    var url = "http://localhost:3000/";

    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("has valid content", function(done) {
      request(url, function(error, response, body) {
        expect(body).to.contain("Node.js Express");
        done();
      });
    });
  });

  describe("Check /info URL", function() {
    var url = "http://localhost:3000/info";

    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("has valid content", function(done) {
      request(url, function(error, response, body) {
        expect(body).to.contain("Server Environmental Variables");
        done();
      });
    });
  });

  describe("Check /load URL", function() {
    var url = "http://localhost:3000/load";

    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("has valid content", function(done) {
      request(url, function(error, response, body) {
        expect(body).to.contain("milliseconds");
        done();
      });
    });
  });
});