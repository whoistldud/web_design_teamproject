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
  if(!req.session.user) res.redirect('/pagemyinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/pagemyinfo');
  res.render('consumer/pagemyinfo', { title: 'able' });
});

router.get('/myorder', async (req, res, next) => {
  if(!req.session.user) res.redirect('/pagemyorder');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/pagemyorder');
  res.render('consumer/pagemyorder', { title: 'able' });
});

router.get('/myqna', async (req, res, next) => {
  if(!req.session.user) res.redirect('/pagemyqna');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/pagemyqna');
  res.render('consumer/pagemyqna', { title: 'able' });
});

router.get('/diary', async (req, res, next) => {
  const result = await mysql.query("diaryProduct");
  res.render("category/diary", { title: "상품 카테고리 다이어리", row: result});
});

router.get('/note', async (req, res, next) => {
  const result = await mysql.query("noteProduct");
  res.render("category/note", { title: "상품 카테고리 필기노트", row: result});
});

router.get('/sticker', async (req, res, next) => {
  const result = await mysql.query("stickerProduct");
  res.render("category/sticker", { title: "상품 카테고리 스티커", row: result});
});

router.get('/wallpaper', async (req, res, next) => {
  const result = await mysql.query("wpaperProduct");
  res.render("category/wallpaper", { title: "상품 카테고리 배경화면", row: result});
});


module.exports = router;