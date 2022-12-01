var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");

var router = express.Router();

require('dotenv').config({
  path : ".env",
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user) res.render('index', { title: 'able' });
  else if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role == 'consumer') res.redirect('/consumer');
  else if(jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role == 'seller') res.redirect('/seller');
});

/* GET  page. */
router.get('/join', function(req, res, next) {
  res.render('index/join', { title: 'able' });
});



/*아이디 중복 확인*/
router.get("/verifyId/:id", async (req, res) => {
  var check = false;
  const {id} = req.params;
  console.log(id);
  const member = await mysql.query("userVertifyId",id);
  if(member[0] != undefined) {
    check = true;
    console.log(member);
  }
  res.send(check);
});

/*회원가입 POST*/
router.post("/join", async (req, res) => {
  const member = await mysql.query("userVertifyId",req.body.id);
  if(member[0] != undefined) {
    res.send("<script>alert('이미 존재하는 아이디 입니다.');location.href='join';</script>");
  }else{
    crypto.pbkdf2(req.body.password, process.env.CRYPTO_SALT, 100000, 64, 'sha512', async (err, key) =>{
      var password = key.toString('base64');
      var data = [req.body.id,password,req.body.name,req.body.email,req.body.phoneNum,req.body.birthday,req.body.role]; 
      const result = await mysql.query("userJoin", data);
    });
    res.send("<script>alert('🎈 환영합니다! 회원가입이 완료되었습니다 ✨');location.href='login';</script>");

  }
});

/*로그인 화면*/
router.get("/login", async (req, res) => {
  res.render('index/login', { title: 'able' });
});

/*로그인 Post*/
router.post('/login',async (req, res) => {
  check = 0;
  console.log(req.body);
  const login = await mysql.query("userLogin", req.body.id);
  if(login[0] == undefined) {
    res.send("<script>alert('존재하지 않는 아이디 입니다.');location.href='login';</script>");
  }else{
    crypto.pbkdf2(req.body.password, process.env.CRYPTO_SALT, 100000, 64, 'sha512', async (err, key) =>{
      var password = key.toString('base64');
      if(password == login[0].password){
        const payload = { // json web token 으로 변환할 데이터 정보
          user: {
            id: req.body.id,
            role: login[0].role
          },
        };
        console.log(payload);
        jwt.sign(
          payload, // 변환할 데이터
          process.env.ACCESS_TOKEN_SECRET, // secret key 값
          { expiresIn: "1h" }, // token의 유효시간
          (err, token) => {    
            if (err) throw err;
            req.session.user = {token:token};
            const obj = {
              status : "success",
              token : token
            };
            res.redirect("/");    
          }
        );
      }else{
        res.send("<script>alert('비밀번호가 틀렸습니다.');location.href='login';</script>");
      }            

    });
  }
});

/*로그아웃*/
router.get('/logout', function(req, res, next) {

  if(!req.session.user){
    res.send("<script>alert('로그인을 하십시오.');location.href='/member/login';</script>");
  }
  
  req.session.destroy(
    function (err) {
      if (err) {
        res.send("<script>alert('로그아웃 에러 발생');location.href='/';</script>");
        return;
      }
      console.log('세션 삭제 성공');
      res.redirect('/login');
    }
  );
});


module.exports = router;
