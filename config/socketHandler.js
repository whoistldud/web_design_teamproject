const { Server } = require("socket.io");
const mysql = require("../config/database.js");
var express = require('express');
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

  io.on("connection", (socket) => {
    // 접속 시 서버에서 실행되는 코드

    let roomId;

    socket.on("disconnect", () => {
    });

    socket.on("connect", (msg) => {
    });

    socket.on("roomId", (msg) => {
      roomId = msg;
    });


    socket.on("drawstart", (msg) => {
      socket.broadcast.emit("draw_start", msg);
    }); 

    socket.on("drawing", (msg) => {
      socket.broadcast.emit("draw", msg);
    }); 

    socket.on("drawend", (msg) => {
      socket.broadcast.emit("draw_end");
    }); 


    socket.on("drawclear", (msg) => {
      socket.broadcast.emit("draw_clear");
    }); 

    socket.on("chat", async (data) => {
      var now = new Date();
      const room = await mysql.query("chat",[data.roomId,data.sender,data.msg,now]);
      console.log(data.roomId,data.msg);
      socket.broadcast.emit("msg"+roomId, { sender : data.sender, message: data.msg });
    });
  });
};
module.exports = socketHandler;