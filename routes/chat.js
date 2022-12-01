var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");

var router = express.Router();

require('dotenv').config({
  path : ".env",
});

router.get('/', function(req, res, next) {
  res.render('chatroom', { title: 'able'});
});


router.get('/room/:id', function(req, res, next) {
  const {id} = req.params;
  res.render('chat', { title: 'able', id : id});
});

module.exports = router;