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
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  res.render('consumer/home', { title: 'able' });
});

router.get('/mypage', function(req, res, next) {
  if(!req.session.user) res.redirect('/mypage');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/mypage');
  res.render('consumer/mypage', { title: 'able' });
});

module.exports = router;