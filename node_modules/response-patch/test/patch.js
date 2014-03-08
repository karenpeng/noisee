/*!
 * reponse-patch - test/patch.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

require('../');
var http = require('http');
var request = require('supertest');
var should = require('should');

describe('patch.js', function () {

  var app = http.createServer(function (req, res) {
    res.req = req;

    if (req.url === '/send') {
      return res.send('hello');
    }
    if (req.url === '/send/buffer') {
      return res.send(new Buffer('hello你好'));
    }
    if (req.url === '/send/json') {
      return res.send({foo: 'bar'});
    }
    if (req.url === '/json') {
      return res.json({json: 123});
    }
    if (req.url === '/redirect') {
      return res.redirect('/');
    }
    if (req.url === '/redirect/301') {
      return res.redirect('/301', 301);
    }
    if (req.url === '/redirect/302') {
      return res.redirect('/302', '302');
    }
    if (req.url === '/jsonp') {
      return res.jsonp({key1: 'value1'});
    }
    if (req.url === '/jsonp/xss1') {
      return res.jsonp({key1: 'value1'}, '</script><script>alert(399220605)</script>');
    }
    if (req.url === '/jsonp/xss2') {
      return res.jsonp({key1: 'value1'}, decodeURIComponent('%3C/script%3E%3Cscript%3Ealert(469517365)%3C/script%3E'));
    }
    if (req.url === '/jsonp/cb') {
      return res.jsonp({key2: 'value2'}, 'cb');
    }
    if (req.url === '/jsonp/buffer') {
      return res.jsonp(new Buffer('mockbuffer'));
    }
    if (req.url === '/jsonp/undefined') {
      return res.jsonp();
    }
    if (req.url === '/jsonp/string') {
      return res.jsonp('str');
    }
    if (req.url === '/jsonp/string500') {
      res.statusCode = 500;
      return res.jsonp('str500');
    }
    if (req.url === '/jsonp/number') {
      return res.jsonp(1);
    }
    if (req.url === '/jsonp/array') {
      return res.jsonp([1, 2, 3]);
    }
    if (req.url === '/jsonp/null') {
      return res.jsonp(null);
    }
  });

  it('should send(str)', function (done) {
    request(app)
    .get('/send')
    .expect(200, 'hello')
    .expect('Content-Type', 'text/html', done);
  });

  it('should send(buffer)', function (done) {
    request(app)
    .get('/send/buffer')
    .expect(200)
    .expect('Content-Type', 'application/octet-stream', done);
  });

  it('should send(json)', function (done) {
    request(app)
    .get('/send/json')
    .expect(200, '{"foo":"bar"}')
    .expect('Content-Type', 'application/json', done);
  });

  it('should json(json)', function (done) {
    request(app)
    .get('/json')
    .expect(200, '{"json":123}')
    .expect('Content-Type', 'application/json', done);
  });

  it('should redirect()', function (done) {
    request(app)
    .get('/redirect')
    .expect(302)
    .expect('Location', '/', done);
  });

  it('should redirect(301)', function (done) {
    request(app)
    .get('/redirect/301')
    .expect(301)
    .expect('Location', '/301', done);
  });

  it('should redirect(302)', function (done) {
    request(app)
    .get('/redirect/302')
    .expect(302)
    .expect('Location', '/302', done);
  });

  it('should jsonp {"key1": "value1"}', function (done) {
    request(app)
    .get('/jsonp')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback({"key1":"value1"})', done);
  });

  it('should jsonp {"key2": "value2"}', function (done) {
    request(app)
    .get('/jsonp/cb')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncb({"key2":"value2"})', done);
  });

  it('should jsonp [1 ,2, 3]', function (done) {
    request(app)
    .get('/jsonp/array')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback([1,2,3])', done);
  });
 
  it('should error response data when data is buffer', function (done) {
    request(app)
    .get('/jsonp/buffer')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback("mockbuffer")', done);
  });

  it('should when data and callback both is undefined', function (done) {
    request(app)
    .get('/jsonp/undefined')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback(undefined)', done);
  });

  it('should jsonp response data when data is string', function (done) {
    request(app)
    .get('/jsonp/string')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback("str")', done);
  });

  it('should jsonp response data type is string and status 500', function (done) {
    request(app)
    .get('/jsonp/string500')
    .expect(500)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback("str500")', done);
  });

  it('should jsonp response data when data is number', function (done) {
    request(app)
    .get('/jsonp/number')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback(1)', done);
  });
  
  it('should jsonp response data when data is null', function (done) {
    request(app)
    .get('/jsonp/null')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\ncallback(null)', done);
  });

  it('should jsonp callback protect XSS1', function (done) {
    request(app)
    .get('/jsonp/xss1')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\n&lt;/script&gt;&lt;script&gt;alert(399220605)&lt;/script&gt;({"key1":"value1"})', done);
  });

  it('should jsonp callback protect XSS2', function (done) {
    request(app)
    .get('/jsonp/xss2')
    .expect(200)
    .expect('Content-Type', 'application/javascript')
    .expect('\r\n&lt;/script&gt;&lt;script&gt;alert(469517365)&lt;/script&gt;({"key1":"value1"})', done);
  });
});
