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
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
  res.render('seller/home', { title: 'able' });
});

router.get('/mypage', function(req, res, next) {
  if(!req.session.user) res.redirect('/pageShopinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopinfo');
  res.render('seller/pageShopinfo', { title: 'able' });
});

router.get('/mygoods', function(req, res, next) {
  if(!req.session.user) res.redirect('/pageProducts');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageProducts');
  res.render('seller/pageProducts', { title: 'able' });
});

router.get('/shopqna', function(req, res, next) {
  if(!req.session.user) res.redirect('/pageShopqna');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopqna');
  res.render('seller/pageShopqna', { title: 'able' });
});

module.exports = router;