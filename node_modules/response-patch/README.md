response-patch [![Build Status](https://secure.travis-ci.org/fengmk2/response-patch.png)](http://travis-ci.org/fengmk2/response-patch) [![Dependencies](http://david-dm.org/fengmk2/response-patch.png)](http://david-dm.org/fengmk2/response-patch)
==============

Monkey patch for `http.ServerResponse`.

## Install

```bash
$ npm install response-patch
```

## Usage

```js
require('response-patch');
var http = require('http');
http.createServer(function (req, res) {
  res.req = req;
  res.send('hello world');
});
```

## APIs

```js
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
res.send = function ([status, ]body);

res.json = function ([status, ]data);

/**
 * Send redirect response.
 * 
 * @param  {Response} res, http.Response instance
 * @param  {String} url, redirect URL
 * @param  {Number|String} status, response status code, default is `302`
 * @api public
 */
res.redirect = function (url, status);

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
res.jsonp = function (data, callback);
```

## License

(The MIT License)

Copyright (c) 2012 - 2013 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.