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
  var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

  res.render('seller/home', { title: '상품 등록', seller:sellerId });

});


router.get('/product', (req,res,next) => {
  
    res.render('seller/pageProductsRegister', { title: '상품 등록' });
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




function categoryToch(result) {
  for (var i = 0; i < result.length; i++){
    if (result[i].category == 1){
      result[i].category = "다이어리";
    }
    else if (result[i].category == 2){
      result[i].category = "필기노트";
    }
    else if (result[i].category == 3){
      result[i].category = "스티커";
    }
    else {
      result[i].category = "배경화면";
    }
  }
}



/* mypage */
router.get('/mypage', function(req, res, next) {
  if(!req.session.user) res.redirect('/pageShopinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopinfo');
  res.render('seller/pageShopinfo', { title: 'able' });
});


router.get('/shopqna', function(req, res, next) {
  if(!req.session.user) res.redirect('/pageShopqna');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopqna');
  res.render('seller/pageShopqna', { title: 'able' });
});


/* 상품 등록 */
router.post("/product/write", upload.single("imageurl"), async(req, res, next) => {
  var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

  var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,req.file.filename]; 
  console.log(data);
  const result = await mysql.query("productWrite", data);
  res.send("<script>alert('상품등록완료.');location.href='/seller/productlist/:sellerId';</script>"); 
});


/* 등록한 상품 list */
router.get('/productlist/:sellerId', async (req,res,next) => {
  var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("productRead", sellerId);
  categoryToch(result);
  // console.log(result[1]);

  res.render('seller/pageProductsList', { title: "등록 상품 목록", row: result});
  
});

/* 등록한 상품 상세 정보 확인 page. */
router.get('/product/read/:id', async (req,res,next) => {
  const id = req.params.id;
  const result = await mysql.query("readImage", id);
  categoryToch(result);
  res.render('seller/pageProductsRead', { title: "상품 조회", row: result[0] });
  console.log(result[0]);
});

/* 상품 삭제 */
router.post("/product/delete/:id", async (req,res,next) => {
  const {id} = req.params.id;
  const result = await mysql.query("productDelete", id);
  console.log(result);
  // res.render('/')
  res.send("<script>alert('상품삭제완료.');location.href='/';</script>"); 
  // res.redirect('/')
});


/* qna */
router.get('/qna', async(req,res,next) => {
  const sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("qnaListRead");
  res.render('seller/qnaList', { title: 'able', row:result, loginId:sellerId});
  console.log('loginId', sellerId);
  // console.log("qna",result[0]);
});
var today = new Date();



/* GET qna 등록 page. */
router.get('/qna/register', (req,res,next) => {
  res.render('seller/qnaRegister', { title: 'able' });
});

router.post("/qna/register", async(req,res) => {
  var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;


  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  var dateString = year + '-' + month  + '-' + day;

  console.log("날짜", dateString);
  var data = [req.body.name,req.body.password,req.body.title,req.body.content,dateString,req.body.lock_post, userId]; 

  const result = await mysql.query("qnaWrite", data);
  console.log(result[0]);
  res.redirect('/seller/myqnalist/:userId');
});

router.get('/qna/read/:id', async (req,res,next) => {
  const id = req.params.id;
  const result = await mysql.query("qnaDetRead", id);
  categoryToch(result);
  res.render('seller/qnaRead', { title: "문의 조회", row: result[0] });
  console.log(result[0]);
});


router.get('/myqnalist/:userId', async (req,res,next) => {
  var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("아이디", userId);
  const result = await mysql.query("myqnaRead", userId);
  categoryToch(result);
  // console.log(result[1]);

  res.render('seller/myqnaList', { title: "내 qna 목록", row: result});
  
});

module.exports = router;