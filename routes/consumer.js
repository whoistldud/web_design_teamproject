var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { myqnaRead } = require('../config/sql.js');

var router = express.Router();

require('dotenv').config({
  path : ".env",
});

router.get('/', function(req, res, next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    res.render('consumer/home', { title: 'able'});
  }  
});

// 장바구니 (상품 목록)
router.get('/mycartlist', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("userLogin", consumerID);
    const result1 = await mysql.query("mycartList", consumerID);
    console.log("가져온 result1", result1);
    
    let prodID = [];
    for(var i=0; i < result1.length ; i++){
      let pid = result1[i].productId;
      prodID.push(pid);
    };
    console.log("prodID", prodID);
    //const result2 = await mysql.query("productlisRead", prodID);
    // 장바구니에 등록하려는 상품이 이미 같은 아이디에 있으면 막기

    res.render('consumer/mycart', { title: 'able', info: result1, consum: result});
  }
});

// 장바구니 상품 상세 (상세페이지로 연결)
router.get('/mycartlist/:id', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const id = req.params.id;
    console.log(id);
    const result = await mysql.query("productlisRead", id);
    const result2 = await mysql.query("reviewlis", id);
    console.log(result[0]);
    console.log('result2!! : ',result2);

    var starSum = 0;
    var starAvg = 0.0;
    var namelock = '';
    var resname = '';
    var tnum = 0;
    var resnameArr = [];
    var tost = '';

    for (let i=0; i<result2.length; i++){
      starSum += result2[i].star;
      tnum = result2[i].userId.length;
      namelock = result2[i].userId.substr(2);
      tost = '*'.repeat(namelock.length);
      resname = result2[i].userId.replace(namelock, tost);
      resnameArr.push(resname);
    }

    console.log(resnameArr);

    starAvg = starSum / result2.length;
    console.log("평점 평균 : ",starAvg);

    const result3 = await mysql.query("userName", result[0].sellerId);
    console.log("result3 : ",result3);
    var storeName = result3[0].name;

    res.render("index/goodsDetail", { title: "상품 정보", row : result[0], review : result2, staravg:starAvg, userName:resnameArr, storename:storeName});
  }
});

// 장바구니에 상품 추가
router.get('/mycart/:id', async function(req,res,next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const id = req.params.id;
    console.log("상품 id", id);

    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    
    const resultN2 = await mysql.query("userLogin", consumerID);
    const prod = await mysql.query("productlisRead", id);
    const prodname = prod[0].name;
    console.log("prodname", prodname);
    const inputdata = [consumerID, id, prodname];
    const result = await mysql.query("intoMycart", inputdata);
    const incart = await mysql.query("mycartList", consumerID);
    console.log("장바구니 확인!!", incart);

    res.render("/index/goodsDetail");
  }
});

// 검색 페이징
router.get('/search', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    console.log("consumerID :", consumerID);
    res.render('consumer/search', { title: 'able'});
  }
});

// 검색 결과 
router.post('/searchres', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    console.log("consumerID :", consumerID);
    let keyword = req.body.keyword;  
    const data = "'%"+keyword+"%'";
    console.log("검색 단어", keyword,data);
    const result = await mysql.query("search", [data,data]);
    console.log("result : ", result);
    res.render('consumer/searchresult', { title: 'able'});
  }
});

// 마이페이지 중 내 정보
router.get('/mypage', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("consumerID :", consumerID);
    const result = await mysql.query("userLogin", consumerID);
    console.log("result : ", result);
    res.render('consumer/pagemyinfo', { title: 'able', info: result});
  }
});

// 내 정보 수정
router.get('/mypage/editinfo', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("userLogin", consumerID);
    res.render('consumer/pageEditMyinfo', { title: 'able', info: result});
  }
});


router.post('/mypage/editinfo/done', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("consumerID :", consumerID);
    console.log(req.params);
    var data = [req.body.newname, req.body.newemail, req.body.newphonenum, consumerID];
    console.log("새로 업데이트 되는 : ", data);

    const result = await mysql.query("userUpdate", data);
    const result2 = await mysql.query("userLogin", consumerID);
    console.log("result2 : ", result2);
    res.redirect("/consumer/mypage");
  }
});

// 구매내역
router.get('/myorder', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("purchaseRead",  consumerID);
    const user = await mysql.query("userLogin", consumerID);
    console.log("상품 : ", result);
    res.render('consumer/pagemyorder', { title: 'able' , user: user[0], row:result});
  }
});

router.get('/mypurchase/:id', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  

    var id = req.params.id;
    console.log("purchaseId : ",req.params );
    const user = await mysql.query("userLogin", consumerID);
    
    const result = await mysql.query("mypurchaseRead", [id, consumerID]);
    var productId = result[0].productId;
    //console.log("result : ",result);
    const result2 = await mysql.query("readImage", productId);

    const review = await mysql.query("reviewRead",  [productId, id]);
    //console.log("리뷰:",review[0]);


    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var todayString = year + '-' + month  + '-' + day;

    console.log("user[0].name", user[0].name);
    res.render('consumer/purchaseRead', {title: 'able', user: user[0], row:result[0], product:result2[0], review:review[0], today:todayString});  
    //console.log("product : ",result2[0]);
  }
});

/* 리뷰 등록 */ 
router.get('/reviewrite/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    var id = req.params.id;
    console.log("여기 : ",req.params );
    const result = await mysql.query("mypurchaseRead", [id, consumerID]);
    console.log("result : ",result);
  
    res.render('consumer/pageReviewRegister', { title: "리뷰 작성", row:result[0]});
  }
});

router.post('/reviewrite/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    var id = req.params.id;
    console.log("req : ", id);
    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '-' + month  + '-' + day;
    console.log("구매 날짜:",dateString);

    const result = await mysql.query("mypurchaseRead", [id, consumerID]);
    console.log("흠..", result);
    var productId = result[0].productId

    var data = [consumerID,productId, req.body.content, req.body.star, dateString,id];
    await mysql.query("reiviewWrite", data);
    res.redirect('/consumer/myorder');
  }
});

/* 리뷰 보기 */
router.get('/reviewRead/:id', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    var id = req.params.id;
    console.log("id:",id);
    const result = await mysql.query("reviewMyRead", id);
    res.render("consumer/pageReviewRead", { title: "리뷰읽기", row:result[0]});
  }
});

/* 리뷰 삭제 */

router.get("/review/delete/:id", async (req,res,next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  const id = req.params.id;
  const result = await mysql.query("reviewDelete", id);
  res.send("<script>alert('리뷰삭제완료.');location.href='/consumer/myorder';</script>"); 
});

router.get('/myqna', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');  
    res.render('consumer/pagemyqna', { title: 'able' });
  }
});

/* 리뷰 */
router.get('/reviewRead', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    res.render("consumer/pageReviewRead", { title: "리뷰읽기"});
  }
});

/* q&a 등록 */
router.get('/qna/register', (req,res,next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  
  res.render('consumer/qnaRegister', { title: 'able' });
});

router.post("/qna/register", async(req,res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
  var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

  var today = new Date();
  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  var dateString = year + '-' + month  + '-' + day;

  console.log("날짜", dateString);
  var data = [req.body.name,req.body.password,req.body.title,req.body.content,dateString,req.body.lock_post, userId]; 

  const result = await mysql.query("qnaWrite", data);
  console.log(result[0]);
  res.redirect('/consumer/myqnalist');
  }
});

router.get('/qna', async(req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{

  const consumerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("qnaListRead");
  res.render('consumer/qnaList', { title: 'able', row:result, loginId:consumerId});
  console.log('loginId', consumerId);
  // console.log("qna",result[0]);
  }
});
var today = new Date();


router.get('/qna/read/:id', async (req,res,next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  const id = req.params.id;
  const result = await mysql.query("qnaDetRead", id);
  res.render('consumer/qnaRead', { title: "문의 조회", row: result[0] });
  console.log(result[0]);
});

router.get("/qna/delete/:id", async (req,res,next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
  const id = req.params.id;
  const result = await mysql.query("qnaDelete", id);
  res.send("<script>alert('질문삭제완료.');location.href='/consumer/myqnaList';</script>"); 
});

router.get('/myqnalist', async (req,res,next) => {
  if(!req.session.user) res.redirect('/');
  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');

  var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
  const result = await mysql.query("myqnaRead", userId);

  res.render('consumer/myqnaList', { title: "내 qna 목록", row: result});
  
});


router.get('/addPoint', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("readPoint", consumerID);
    res.render("consumer/pagemypoint", { title: "able", row: result});
  }
});

router.post('/addPoint', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/'); 
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("addPoint", [req.body.addpoint, consumerID]);
    res.redirect("/consumer/addpoint");
  }
});

// 카테고리 연결 router를 하나로 할 수 있다면..
/*
router.get('category/:category'), async (req, res, next) => {
  const result = await mysql.query("cateProduct", )
}
*/

// 다이어리 상품
router.get('/diary', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const result = await mysql.query("diaryProduct");
    res.render("category/diary", { title: "다이어리 상품", row: result});
  }
});

// 필기노트 상품
router.get('/note', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const result = await mysql.query("noteProduct");
    res.render("category/note", { title: "필기노트 상품", row: result});
  }
});

// 스티커 상품
router.get('/sticker', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const result = await mysql.query("stickerProduct");
    res.render("category/sticker", { title: "스티커 상품", row: result});
  }
});

 //배경화면 상품
router.get('/wallpaper', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const result = await mysql.query("wpaperProduct");
    res.render("category/wallpaper", { title: "배경화면 상품", row: result});
  }
});

// 상품 상세 페이지
router.get('/details/:id', async function(req, res, next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const id = req.params.id;
    console.log(id);
    const result = await mysql.query("productlisRead", id);
    const result2 = await mysql.query("reviewlis", id);
    console.log(result[0]);
    console.log('result2!! : ',result2);

    var starSum = 0;
    var starAvg = 0.0;
    var namelock = '';
    var resname = '';
    var tnum = 0;
    var resnameArr = [];
    var tost = '';

    for (let i=0; i<result2.length; i++){
      starSum += result2[i].star;
      tnum = result2[i].userId.length;
      namelock = result2[i].userId.substr(2);
      tost = '*'.repeat(namelock.length);
      resname = result2[i].userId.replace(namelock, tost);
      resnameArr.push(resname);
    }

    console.log(resnameArr);

    starAvg = starSum / result2.length;
    console.log("평점 평균 : ",starAvg);

    const result3 = await mysql.query("userName", result[0].sellerId);
    console.log("result3 : ",result3);
    var storeName = result3[0].name;

    res.render("index/goodsDetail", { title: "상품 정보", row : result[0], review : result2, staravg:starAvg, userName:resnameArr, storename:storeName});
  }
});



router.get('/buy/:id', async function(req,res,next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
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
    }
});

router.get('/buycomplete', async function(req,res,next){
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    res.render('index/completePurchase', { title: "구매 완료"});
  }
});

router.post('/buy/bycom/:id', async function(req,res,next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log(consumerID);
    
    const id = req.params.id;
    console.log("아이딩",id);

    var today = new Date();
    var downpos = new Date(today);

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '-' + month  + '-' + day;

    console.log("구매 날짜:",dateString);

    downpos.setDate(today.getDate()+3);

    var year2 = downpos.getFullYear();
    var month2 = ('0' + (downpos.getMonth() + 1)).slice(-2);
    var day2 = ('0' + downpos.getDate()).slice(-2);
    var dateString2 = year2 + '-' + month2  + '-' + day2;
    console.log("다운로드 가능 기한:",dateString2);




    const resultN1 = await mysql.query("productlisRead", id);
    resultN1[0].price = Number( resultN1[0].price.replace(",",""));
    console.log(resultN1[0].price);

    console.log(resultN1[0].price, consumerID);
    const resultN2 = await mysql.query("minusPoint", [resultN1[0].price, consumerID]);

    var data = [id,consumerID, resultN1[0].name, dateString, dateString2];
    console.log('구매 데이터',data);
    // // res.render("index/purchage", { title: "상품 구매" ,row : resultN1[0], consum : resultN2[0], point:resultN3[0]});
    const resultN3 = await mysql.query("newPurchase", data);
    res.send("<script>alert('상품 구매 완료.');location.href='/consumer/buycomplete';</script>"); 
  }
})

router.post('/buy/downcount/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const id = req.params.id;
    let consumerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log('흠.. :', req.rescount);
  }
  // res.redirect('/');
});



//채팅리스트
router.get('/chatlist', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'consumer') res.redirect('/');
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const room = await mysql.query("chatroomList",[userId,userId]);
    var product = [];
    for(var i=0; i<room.length; i++){
      product[i] = await mysql.query("productlisRead",room[i].productId);
    }
    console.log(product);
    res.render('consumer/chatroom', {rooms:room,products:product});
  }  
});


module.exports = router;