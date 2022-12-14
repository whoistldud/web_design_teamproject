var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");

var router = express.Router();

require('dotenv').config({
  path : ".env",
});

/*채팅방 만들기*/
router.get('/enter/:productId', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{
    const productId = req.params.productId;
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    var roomId;
    const room = await mysql.query("enterRoom",[productId,userId,userId]);
    if(room[0] == undefined) {
      let sellerId = await mysql.query("findSeller",productId);
      console.log(sellerId);
      sellerId = sellerId[0].sellerId;
      const room = await mysql.query("createRoom",[productId,sellerId,userId]);
      roomId = room.insertId;
      console.log(room);
    }else roomId = room[0].chatroomId;

    res.redirect('/chat/room/'+roomId);
  }
});


router.get('/room/:id', async (req, res) => {
  if(req.session.user == undefined)  {
    res.send("<script>alert('로그인을 하십시오.');location.href='/login';</script>");
  }
  else{  
    const {id} = req.params;
    const userId = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.id;
    const role = jwt.verify(req.session.user.token, process.env.ACCESS_TOKEN_SECRET).user.role;
    const room = await mysql.query("checkRoom",[id,userId,userId]);
    if(room[0] == undefined)  {
      res.send("<script>alert('방에 대한 권한이 없습니다.');location.href='/';</script>");
    }else{
        const chat = await mysql.query("chatroom",id);
        res.render('chat', {id : id, chats : chat, senderId : userId, role :role , state : room[0].state});
    }
  }    

});

module.exports = router;