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
      cb(null, "public/drawing/");
  },
  filename : function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

var upload = multer({storage: storage});

router.get('/:id', async(req, res, next) => {
  const image = await mysql.query("setImage",req.params.id);
  const imgurl = image[0].Imageurl;
  console.log(image,imgurl);
  res.render('draw', {imgurl, id:req.params.id});

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