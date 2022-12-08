var express = require('express');
const mysql = require("../config/database.js");
const crypto= require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

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



router.get('/', function(req, res, next) {

  res.render('draw');

});


router.post('/save',  upload.single("imageurl"), async(req, res, next) => {
  console.log(req.body.url);
/*  const member = await mysql.query("saveImage",req.body.imgUrl);
  if(member[0]!=undefined){
    res.sendStatus(success);
  }*/

});

module.exports = router;