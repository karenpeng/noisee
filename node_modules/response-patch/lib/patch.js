/*!
 * response-patch - lib/patch.js
 * Copyright(c) 2012 Taobao.com
 * Author: suqian.yf <suqian.yf@taobao.com>
 */

"use strict";

/**
 * Module dependencies.
 */

var utility = require('utility');
var http = require('http');
var send = require('response-send');
var res = http.ServerResponse.prototype;

// #nodejsWTF? not work in node < 0.8.0
// https://github.com/visionmedia/node-response-send/issues/1

// http.ServerResponse.prototype.__defineGetter__('req', function () {
//   return this.__req || this.socket.parser.incoming;
// });

/**
 * Send a response.
 *
 * Examples:
 *
 *     res.send(new Buffer('wahoo'));
 *     res.send({ some: 'json' });
 *     res.send('<p>some html</p>');
 *     res.send(404, 'Sorry, cant find that');
 *     res.send(404);
 *
 * @param {Mixed} body or status
 * @param {Mixed} body
 * @return {ServerResponse}
 * @api public
 */
res.send = send;

res.json = send.json();

/**
 * Send redirect response.
 * 
 * @param  {Response} res, http.Response instance
 * @param  {String} url, redirect URL
 * @param  {Number|String} status, response status code, default is `302`
 * @api public
 */
res.redirect = function (url, status) {
  if (typeof status === 'string') {
    status = parseInt(status, 10);
  }
  this.statusCode = status === 301 ? 301 : 302;
  this.setHeader('Location', url);
  this.end();
};

// utf7 xss
var hat_content = '\r\n';

/**
 * Jsonp response.
 * 
 * @param {Object} data, object is only supported
 * @param {String} [callback], default is `'callback'`.
 * Examples:
 *
 * ```js
 * res.jsonp({"key": "value"});
 * res.jsonp({"key": "value"}, 'cb');
 * ```
 * 
 * @api public
 */
res.jsonp = function (data, callback) {
  callback = callback || 'callback';
  if (Buffer.isBuffer(data)) {
    data = data.toString();
  }
  var body = JSON.stringify(data);
  body = hat_content + utility.escape(callback) + '(' + body + ')';
  this.charset = this.charset || 'utf-8';
  this.setHeader('Content-Type', 'application/javascript');
  return this.send(body); 
};
