const { Server } = require("socket.io");
var express = require('express');
const mysql = require("../config/database.js");
const jwt = require("jsonwebtoken");
const session = require("express-session");

var router = express.Router();

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  let user = {};

  io.on("connection", (socket) => {
    // 접속 시 서버에서 실행되는 코드
    const req = socket.request;
    const socket_id = socket.id;
    const client_ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("connection!");
    console.log("socket ID : ", socket_id);
    console.log("client IP : ", client_ip);

    user[socket.id] = { nickname: "users nickname", point: 0 };

    socket.on("disconnect", () => {
      // 사전 정의 된 callback (disconnect, error)
      //console.log(socket.id, " client disconnected");
      delete user[socket.id];
    });


    socket.on("connect", (msg) => {
      //DB 방 정보 연결
      console.log(msg); 
      socket.emit("getID", socket.id);
    });

    // 본인 제외한 모든 소켓
    socket.on("chat", (data) => {
      //DB 방 저장
      console.log(data.roomId,data.msg);
      console.log(socket.id);
      socket.broadcast.emit("msg"+data.roomId, { id: socket.id, message: data.msg });
      //console.log(data, " 를 받았는데, 본인 빼고 broadcast 해야함");
    });


  });
};
module.exports = socketHandler;