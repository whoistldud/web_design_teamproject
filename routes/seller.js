var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

var router = express.Router();

require('dotenv').config({
  path : ".env",
});

router.get('/', function(req, res, next) {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
  res.render('seller/home', { title: '상품 등록' });
});

router.get('/product', (req,res,next) => {
    res.render('seller/productRegister', { title: '상품 등록' });
});

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, "public/images/");
  },
  filename : function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

var upload = multer({storage: storage});

router.post("/product/write", upload.single("imageurl"), async(req, res, next) => {
  var data = [req.body.name,req.body.category,req.body.detail,req.body.price,req.file.filename]; 
  console.log(data);
  const result = await mysql.query("productWrite", data);
  res.send("<script>alert('상품등록완료.');location.href='/';</script>"); 
  // mypage로 이동할 수 있게 바꾸기
});



/* GET 상품 확인 page. */
router.get('/product/read/:id', async (req,res,next) => {
  const id = req.params.id;
    const result = await mysql.query("readImage", id);
  res.render('seller/productRead', { title: "상품 조회", row: result[0] });
});


router.get('/mypage', async (req,res,next) => {
  res.render('seller/mypage', { title: "마이페이지"});
});

router.get('/productlist', async (req,res,next) => {
  res.render('seller/productList', { title: "등록 상품 목록"});
});

module.exports = router;