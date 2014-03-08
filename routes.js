/*!
 * resonate - routes.js 
 * Copyright(c) 2013 
 * Author: karen <karenpenglabs@gmail.com>
 */

'use strict';

/**
 * Module dependencies.
 */
var home = require('./controllers/home');

module.exports = function (app) {
  app.get('/', home);
};
