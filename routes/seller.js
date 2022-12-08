var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const { Console } = require('console');

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



router.get('/shopqna', function(req, res, next) {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
  res.render('seller/pageShopqna', { title: 'able' });
});


/* 상품 등록 */
// router.post("/product/write", upload.single("imageurl"), async(req, res, next) => {
//   var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

//   var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,req.file.filename]; 
//   console.log(data);
//   const result = await mysql.query("productWrite", data);
//   res.send("<script>alert('상품등록완료.');location.href='/seller/productlist/:sellerId';</script>"); 
// });

router.post("/product/write", upload.fields([{name:"thumbnailimageurl", maxCount:1}, {name:"detailimageurl", maxCount:1}, {name:"fileurl", maxCount:1}]), async(req, res, next) => {
  const id = req.params.id;
  var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

  console.log("흠", req.files.thumbnailimageurl);
  console.log("흠", req.files['thumbnailimageurl'][0]);
  if (req.files.length == 3){
    var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,
      req.files['thumbnailimageurl'][0].filename,req.files['detailimageurl'][0].filename,req.files['fileurl'][0].filename]; 
  }
  else {
    var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,
      req.files['thumbnailimageurl'][0].filename,'null',req.files['fileurl'][0].filename]; 
  }
  
  console.log(data);
  const result = await mysql.query("productWrite", data);
  res.send("<script>alert('상품등록완료.');location.href='/seller/productlist';</script>"); 
});

/* 등록한 상품 list */
router.get('/productlist', async (req,res,next) => {
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

/* 상품 수정 */
router.get('/product/edit/:id', async (req,res,next) => {
  const id = req.params.id;
  const result = await mysql.query("readImage", id);
  res.render('seller/pageProductEdit', { title: "상품 수정", row: result[0] });

});

router.post('/product/edit/done/:id', async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  var data = [req.body.newname, req.body.newcategory,req.body.newdetail,req.body.newprice, id]; 
  console.log(req.params);
  console.log("상품 수정 data : ", data);
  await mysql.query("productUpdate", data); //수정
  const result = await mysql.query("readImage", id);
  console.log("수정 결과 : ", result[0]);
  res.redirect("/seller/product/read/" + id); 
});

/* 상품 삭제 */
router.get("/product/delete/:id", async (req,res,next) => {
  const id = req.params.id;
  console.log(' 아디',id);
  const result = await mysql.query("productDelete", id);
  // console.log(result);
  // res.render('/')
  res.send("<script>alert('상품 삭제 완료.');location.href='/seller/productlist';</script>"); 
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
  res.redirect('/seller/myqnalist');
});

router.get('/qna/read/:id', async (req,res,next) => {
  const id = req.params.id;
  const result = await mysql.query("qnaDetRead", id);
  res.render('seller/qnaRead', { title: "문의 조회", row: result[0] });
  console.log(result[0]);
});

router.get("/qna/delete/:id", async (req,res,next) => {
  const id = req.params.id;
  console.log(' 아디',id);
  const result = await mysql.query("qnaDelete", id);
  // console.log(result);
  // res.render('/')
  res.send("<script>alert('질문삭제완료.');location.href='/seller/myqnaList';</script>"); 
  // res.redirect('/')
});


router.get('/myqnalist', async (req,res,next) => {
  var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("아이디", userId);
  const result = await mysql.query("myqnaRead", userId);
  // console.log(result[1]);

  res.render('seller/myqnaList', { title: "내 qna 목록", row: result});
  
});

router.get('/mypage', async (req, res, next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/mypage');
  let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("sellerID :", sellerID);
  const result = await mysql.query("userLogin", sellerID);
  console.log("result : ", result);
  res.render('seller/mypage', { title: 'able', info: result });
});

router.get('/mypage/pageShopinfo', async (req, res, next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopinfo');
  let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("sellerID :", sellerID);
  const result = await mysql.query("userLogin", sellerID);
  console.log("result : ", result);
  res.render('seller/pageShopinfo', { title: 'able', info: result });
});

router.get('/mygoods', function(req, res, next) {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageProducts');
  res.render('seller/pageProducts', { title: 'able' });
});

router.get('/shopqna', function(req, res, next) {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopqna');
  res.render('seller/pageShopqna', { title: 'able' });
});

// seller 매장 정보 수정
router.get('/mypage/editShopinfo', async (req, res, next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopinfo');
  let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("sellerID :", sellerID);
  const result = await mysql.query("userLogin", sellerID);
  console.log("result : ", result);
  res.render('seller/pageEditShopinfo', { title: 'able', info: result });
});

router.post('/mypage/editShopinfo/done', async (req, res, next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/pageShopinfo');
  let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("sellerID :", sellerID);

  console.log(req.params);
  var data = [req.body.newname, req.body.newemail, req.body.newphonenum, sellerID];

  const result = await mysql.query("userUpdate", data);
  const result2 = await mysql.query("userLogin", sellerID);
  console.log("result2 : ", result2);
  res.redirect("/seller/mypage/pageShopinfo");
});

module.exports = router;