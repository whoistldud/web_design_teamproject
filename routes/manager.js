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

router.get('/', async(req, res, next) => {
    if(req.session.user == undefined)  {
      res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
    }
    else{  
        const managerId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
        const result = await mysql.query("qnaListRead");
        res.render('manager/qnaList', { title: '관리자홈', row:result, loginId:managerId});
        console.log('loginId', managerId);
    }
  });



router.get('/qna/read/:id', async (req,res,next) => {
    if(req.session.user == undefined)  {
        res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
      }
    else{ 
    const id = req.params.id;
    const result = await mysql.query("qnaDetRead", id);
    res.render('manager/qnaRead', { title: "문의 조회", row: result[0] });
    console.log(result[0]);
    }
  });

module.exports = router;