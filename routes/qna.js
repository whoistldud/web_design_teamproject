var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");

var router = express.Router();

var today = new Date();
var year = today.getFullYear();
var month = ('0' + (today.getMonth() + 1)).slice(-2);
var day = ('0' + today.getDate()).slice(-2);

var dateString = year + '-' + month  + '-' + day;


require('dotenv').config({
  path : ".env",
});

/* GET qna 목록 page. */
router.get('/', (req,res,next) => {
  res.render('index/qnaList', { title: 'able' });

});

/* GET qna 등록 page. */
router.get('/register', (req,res,next) => {
  res.render('index/qnaRegister', { title: 'able' });
});

router.post("/register", async(req,res) => {
  var data = [req.body.name,req.body.password,req.body.title,req.body.content,dateString,req.body.lock_post]; 
  const result = await mysql.query("qnaWrite", data);
  console.log(result);
  res.redirect('/');
});

module.exports = router;