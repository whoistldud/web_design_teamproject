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


router.get('/', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    var LoginId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    // allprod : 모든 상품 불러오기
    const allprod = await mysql.query("productAll");
    let array =[]; 
    for (var i=0; i<allprod.length; i++){
      let sellerId = allprod[i].sellerId;
      array.push(sellerId);
    };
    let seller = [...new Set(array)]; // 중복 없이 모든 판매자 저장한 리스트
    

    let wprod = [];

    // 특정 판매자의 판매상품 불러오기
    for(var j=0; j<seller.length ; j++){

      console.log(seller[j]);
      // seller[j]의 상품 정보 모두 불러옴
      const myprod = await mysql.query("aroundprod", seller[j]);

      console.log("myprod[0] 되나", myprod[0].name); // ㅇㅇ 된다아아앙
      const sellername = await mysql.query("userName", seller[j]);
      myprod.unshift(sellername[0].name);
 
      wprod.push(myprod);
      
    }

    res.render('seller/home', { title: 'HOME for seller', loginid : LoginId, seller: seller, res: wprod});
  }

});


router.get('/product', (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    res.render('seller/pageProductsRegister', { title: '상품 등록' });
  }
});

// 둘러보기 
router.get('/lookAround', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    
    var LoginId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    // allprod : 모든 상품 불러오기
    const allprod = await mysql.query("productAll");
    let array =[]; 
    for (var i=0; i<allprod.length; i++){
      let sellerId = allprod[i].sellerId;
      array.push(sellerId);
    };
    let seller = [...new Set(array)]; // 중복 없이 모든 판매자 저장한 리스트
    

    let wprod = [];

    // 특정 판매자의 판매상품 불러오기
    for(var j=0; j<seller.length ; j++){

      console.log(seller[j]);
      // seller[j]의 상품 정보 모두 불러옴
      const myprod = await mysql.query("aroundprod", seller[j]);

      console.log("myprod[0] 되나", myprod[0].name); // ㅇㅇ 된다아아앙
      const sellername = await mysql.query("userName", seller[j]);
      myprod.unshift(sellername[0].name);
 
      wprod.push(myprod);
      
    }
    //console.log("seller is ", seller);


    res.render('seller/lookAround', { title: "able", loginid : LoginId, seller: seller, res: wprod });
  }
});

// 판매자별 상품 보기
router.get('/lookAsellers/:id', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    
    const id = req.params.id; // sellerID
    console.log("받은 id", id);
      // seller의 상품 정보 모두 불러옴
      const myprod = await mysql.query("aroundprod", id);
      console.log("sellers/", myprod);

      const sellername = await mysql.query("userName", id);
      console.log("sellername[0].name ", sellername[0].name);
      console.log("myprod", myprod); 

    res.render("seller/lookAsellers", { title: sellername[0].name+"의 상품", sellername : sellername[0].name, res: myprod});
  }
});

// 판매자별 상품 보기 > 제품 상세
router.get('/lookAsellers/details/:id', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    
    const id = req.params.id; // productID
    console.log("받은 id", id);

    const result = await mysql.query("productlisRead", id);
    const result2 = await mysql.query("reviewlis", id);

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

    starAvg = starSum / result2.length;
    console.log("평점 평균 : ",starAvg);

    const result3 = await mysql.query("userName", result[0].sellerId);
    var storeName = result3[0].name;

    
    res.render("index/lookAgoods", { title: "상품 정보", row : result[0], review : result2, staravg:starAvg, userName:resnameArr, storename:storeName});
  }
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
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');  if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
     res.render('seller/pageShopqna', { title: 'able' });
  }
});


/* 상품 등록 */

router.post("/product/write", upload.fields([{name:"thumbnailimageurl", maxCount:1}, {name:"detailimageurl", maxCount:1}, {name:"fileurl", maxCount:1}]), async(req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
 
    const id = req.params.id;
    var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;

    if (req.files.length == 3){
      var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,
        req.files['thumbnailimageurl'][0].filename,req.files['detailimageurl'][0].filename,req.files['fileurl'][0].filename]; 
    }
    else {
      var data = [req.body.name,sellerId, req.body.category,req.body.detail,req.body.price,
        req.files['thumbnailimageurl'][0].filename,'null',req.files['fileurl'][0].filename]; 
    }
    
    //console.log(data);
    const result = await mysql.query("productWrite", data);
    res.send("<script>alert('상품등록완료.');location.href='/seller/productlist';</script>"); 
  }
});

/* 등록한 상품 list */
router.get('/productlist', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    var sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("productRead", sellerId);
    categoryToch(result);

    res.render('seller/pageProductsList', { title: "등록 상품 목록", row: result});
  }
});

/* 등록한 상품 상세 정보 확인 page. */
router.get('/product/read/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const id = req.params.id;
    const result = await mysql.query("readImage", id);
    categoryToch(result);
    res.render('seller/pageProductsRead', { title: "상품 조회", row: result[0] });
    console.log(result[0]);
  }
});

/* 상품 수정 */
router.get('/product/edit/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const id = req.params.id;
    const result = await mysql.query("readImage", id);
    res.render('seller/pageProductEdit', { title: "상품 수정", row: result[0] });
  }
});

router.post('/product/edit/done/:id', upload.fields([{name:"newthumbnailimageurl", maxCount:1}, {name:"newdetailimageurl", maxCount:1}, {name:"newfileurl", maxCount:1}]),async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
  const id = req.params.id;

  const temp = await mysql.query("readImage", id);
  
  console.log("temp",temp[0].thumbnailimageurl);
  if (req.files.length == 3){
    var data = [req.body.newname,req.body.newcategory,req.files['newthumbnailimageurl'][0].filename,req.files['newfileurl'][0].filename,req.body.newdetail,
    req.files['newdetailimageurl'][0].filename,req.body.newprice, id]; 
  }

  else if (req.files.length== 2){
    if (Object.keys(req.files)[0] == 'newthumbnailimageurl'){
      if(Object.keys(req.files)[1] == 'newdetailimageurl'){
        var data = [req.body.newname,req.body.newcategory,req.files['newthumbnailimageurl'][0].temp[0].fileurl,req.body.newdetail,
        req.files['newdetailimageurl'][0].filename,req.body.newprice, id]; 
        
      }
      else if(Object.keys(req.files)[1] == 'newfileurl'){
        var data = [req.body.newname,req.body.newcategory,req.files['newthumbnailimageurl'][0].filename,req.files['newfileurl'][0].filename,req.body.newdetail,
        temp[0].detailimageurl,req.body.newprice, id]; 
      }
      else if (Object.keys(req.files)[0] == 'newfileurl'){
        var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,req.files['newfileurl'][0].filename,req.body.detail,
        temp[0].detailimageurl,req.body.newprice, id]; 
      }
      else {
        var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,temp[0].fileurl,req.body.detail,
        req.files['newdetailimageurl'][0].filename,req.body.newprice, id]; 
      }

    }
    else if (Object.keys(req.files)[0] == 'newfileurl'){
      var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,req.files['newfileurl'][0].filename,req.body.newdetail,
      req.files['newdetailimageurl'][0].filename,req.body.newprice, id]; 
      
    }
  }

  else if (Object.keys(req.files).length == 1) {
    console.log("1개 업로드 됨", req.files);
    if (Object.keys(req.files)[0] == 'newthumbnailimageurl'){
      var data = [req.body.newname,req.body.newcategory,req.files['newthumbnailimageurl'][0].filename,temp[0].fileurl,req.body.newdetail,
      temp[0].detailimageurl,req.body.newprice, id]; 
    }
    else if (Object.keys(req.files)[0] == 'newfileurl'){
      var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,req.files['newfileurl'][0].filename,req.body.newdetail,
      temp[0].detailimageurl,req.body.newprice, id]; 
    }
    else {
      var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,temp[0].fileurl,req.body.newdetail,
      req.files['newdetailimageurl'][0].filename,req.body.newprice, id]; 
    }

  }
  else {
    var data = [req.body.newname,req.body.newcategory,temp[0].thumbnailimageurl,temp[0].fileurl,req.body.newdetail,
    temp[0].detailimageurl,req.body.newprice, id]; 
  }
    //console.log("상품 수정 data : ", data);
    await mysql.query("productUpdate", data); //수정
    const result = await mysql.query("readImage", id);
    console.log("수정 결과 : ", result[0]);
    res.redirect("/seller/product/read/" + id); 
  }
});

/* 상품 삭제 */
router.get("/product/delete/:id", async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const id = req.params.id;
    console.log(' 아디',id);
    const result = await mysql.query("productDelete", id);

    res.send("<script>alert('상품 삭제 완료.');location.href='/seller/productlist';</script>"); 

  }
});


/* qna */
router.get('/qna', async(req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const sellerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const result = await mysql.query("qnaListRead");
    res.render('seller/qnaList', { title: 'able', row:result, loginId:sellerId});
    console.log('loginId', sellerId);

  }
});
var today = new Date();



/* GET qna 등록 page. */
router.get('/qna/register', (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    res.render('seller/qnaRegister', { title: 'Q&A' });
  }
});

router.post("/qna/register", async(req,res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
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
  }
});

router.get('/qna/read/:id', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const id = req.params.id;
    const result = await mysql.query("qnaDetRead", id);
    res.render('seller/qnaRead', { title: "문의 조회", row: result[0] });
    console.log(result[0]);
  }
});

router.get("/qna/delete/:id", async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const id = req.params.id;
    console.log(' 아디',id);
    const result = await mysql.query("qnaDelete", id);
    // console.log(result);
    // res.render('/')
    res.send("<script>alert('질문삭제완료.');location.href='/seller/myqnaList';</script>"); 
    // res.redirect('/')
  }
});


router.get('/myqnalist', async (req,res,next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');

    var userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("아이디", userId);
    const result = await mysql.query("myqnaRead", userId);
    // console.log(result[1]);

    res.render('seller/myqnaList', { title: "내 qna 목록", row: result});
  }
});

router.get('/mypage', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("sellerID :", sellerID);
    const result = await mysql.query("userLogin", sellerID);
    console.log("result : ", result);
    res.render('seller/mypage', { title: 'able', info: result });
  }
});

router.get('/mypage/pageShopinfo', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("sellerID :", sellerID);
    const result = await mysql.query("userLogin", sellerID);
    console.log("result : ", result);
    res.render('seller/pageShopinfo', { title: 'able', info: result });
  }
});

router.get('/mygoods', function(req, res, next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    res.render('seller/pageProducts', { title: 'able' });
  }
});

router.get('/shopqna', function(req, res, next) {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    res.render('seller/pageShopqna', { title: 'able' });
  }
});

// seller 매장 정보 수정
router.get('/mypage/editShopinfo', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("sellerID :", sellerID);
    const result = await mysql.query("userLogin", sellerID);
    console.log("result : ", result);
    res.render('seller/pageEditShopinfo', { title: 'able', info: result });
  }
});

router.post('/mypage/editShopinfo/done', async (req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    let sellerID = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    console.log("sellerID :", sellerID);

    console.log(req.params);
    var data = [req.body.newname, req.body.newemail, req.body.newphonenum, sellerID];

    const result = await mysql.query("userUpdate", data);
    const result2 = await mysql.query("userLogin", sellerID);
    console.log("result2 : ", result2);
    res.redirect("/seller/mypage/pageShopinfo");
  }
});

//채팅리스트
router.get('/chatlist', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const room = await mysql.query("chatroomList",[userId,userId]);
    var product = [];
    for(var i=0; i<room.length; i++){
      product[i] = await mysql.query("productlisRead",room[i].productId);
    }
    console.log(product);
    res.render('seller/chatroom', {rooms:room,products:product});
  }  
});

router.get('/worklist', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const room = await mysql.query("workRoomList");
    res.render('seller/workroom', {rooms:room});
  }  
});

router.get('/creatework', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const room = await mysql.query("creatework",userId);
    console.log(room);
    res.redirect('/draw/'+room.insertId);
  }  
});

module.exports = router;