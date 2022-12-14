var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

require('dotenv').config({
  path : ".env",
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

router.get('/:id', async(req, res, next) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role != 'seller') res.redirect('/');
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const image = await mysql.query("setdrawImage",req.params.id);
    const imgurl = image[0].Imageurl;
    console.log()
    const chat = await mysql.query("workchatroom",req.params.id);

    console.log(image[0].participants.indexOf(','+userId),','+userId);
    if(userId == image[0].sellerId || image[0].participants.indexOf(','+userId) != -1) res.render('draw', {chats : chat, title : image[0].title, senderId : userId, imgurl, id:req.params.id});
    else if(image[0].maximum == image[0].currentnum) res.send("<script>alert('방이 꽉 찼습니다.');location.href='/seller/worklist';</script>");
    else{
      const participants = image[0].participants + ',' + userId;
      await mysql.query("updateMember",[participants,req.params.id]);    
      res.render('draw', {chats : chat, title : image[0].title, senderId : userId, imgurl, id:req.params.id});
    }
  }
});
 

router.post('/save/:id',upload.single('file'), async(req, res, next) => {
  //req.file.path = '/drawing/'
  console.log(req.file);

  const member = await mysql.query("saveImage",[req.file.filename,req.params.id]);
  if(member[0]!=undefined){
    res.sendStatus(success);
  }

});

module.exports = router;