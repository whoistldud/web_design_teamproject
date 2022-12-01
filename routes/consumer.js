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
  res.render('consumer/home', { title: 'able'});
});

router.get('/mypage', async (req, res, next) => {
  if(!req.session.user) res.redirect('/pagemyinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/pagemyinfo');
  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("consumerID :", consumerID);
  const result = await mysql.query("userLogin", consumerID);
  console.log("result : ", result);
  res.render('consumer/pagemyinfo', { title: 'able', info: result});
});

router.get('/mypage/editinfo', async (req, res, next) => {
  if(!req.session.user) res.redirect('/pagemyinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/pageEditMyinfo');
  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("userLogin", consumerID);
  res.render('consumer/pageEditMyinfo', { title: 'able', info: result});
});


router.post('/mypage/editinfo/done', async (req, res, next) => {

  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log("consumerID :", consumerID);
  console.log(req.params);
  var data = [req.body.newname, req.body.newemail, req.body.newphonenum, consumerID];
  console.log("새로 업데이트 되는 : ", data);

  const result = await mysql.query("userUpdate", data);
  const result2 = await mysql.query("userLogin", consumerID);
  console.log("result2 : ", result2);
  res.redirect("/consumer/mypage");
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

router.get('/addPoint', async (req, res, next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("readPoint", consumerID);
  res.render("consumer/pagemypoint", { title: "able", row: result});
});

router.post('/addPoint', async (req, res, next) => {
  if(!req.session.user) res.redirect('/pagemyinfo');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("addPoint", [req.body.addpoint, consumerID]);
  res.redirect("/consumer/addpoint");
});

// 카테고리 연결 router를 하나로 할 수 있다면..
/*
router.get('category/:category'), async (req, res, next) => {
  const result = await mysql.query("cateProduct", )
}
*/

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

router.get('/details/:id', async function(req, res, next) {
  const id = req.params.id;
  console.log(id);
  const result = await mysql.query("productlisRead", id);
  console.log(result[0]);
  res.render("index/goodsDetail", { title: "상품 정보", row : result[0]});
});



router.get('/buy/:id', async function(req,res,next) {
  const id = req.params.id;
  // console.log(id);

  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;


  const resultN1 = await mysql.query("productlisRead", id);
  const resultN2 = await mysql.query("userLogin", consumerID);
  const resultN3 = await mysql.query("readPoint", consumerID);

  console.log("확인!!", resultN1[0]);
  resultN1[0].price = Number( resultN1[0].price.replace(",","")); //price를 varchar -> int 변환

  console.log('흠',resultN1[0]);

  res.render("index/purchase", { title: "상품 구매" ,row : resultN1[0], consum : resultN2[0], point:resultN3[0]});

})

router.get('/buycomplete', async function(req,res,next){
  res.render('index/completePurchase', { title: "구매 완료"});
})

router.post('/buy/bycom/:id', async function(req,res,next) {
  let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  console.log(consumerID);
  
  const id = req.params.id;
  console.log("아이딩",id);

  const resultN1 = await mysql.query("productlisRead", id);
  resultN1[0].price = Number( resultN1[0].price.replace(",",""));
  console.log(resultN1[0].price);

  console.log(resultN1[0].price, consumerID);
  const resultN2 = await mysql.query("minusPoint", [resultN1[0].price, consumerID]);

  var data = [id,consumerID, resultN1[0].price];
  console.log('구매 데이터',data);
  // // res.render("index/purchage", { title: "상품 구매" ,row : resultN1[0], consum : resultN2[0], point:resultN3[0]});
  const resultN3 = await mysql.query("newPurchase", data);
  res.send("<script>alert('상품 구매 완료.');location.href='/consumer/buycomplete';</script>"); 
})


module.exports = router;