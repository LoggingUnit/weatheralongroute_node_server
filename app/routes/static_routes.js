// static_routes.js
const express = require('express');

module.exports = function (app, db) {

  app.use(express.static('static'));  
  
};
