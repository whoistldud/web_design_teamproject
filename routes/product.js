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

/* GET 상품 등록 page. */
router.get('/', (req,res,next) => {
    res.render('index/productRegister', { title: '상품 등록' });
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

router.post("/write", upload.single("imageurl"), async(req, res, next) => {

    var data = [req.body.name,req.body.category,req.body.detail,req.body.price,req.file.filename]; 
    console.log(data);
    const result = await mysql.query("productWrite", data);
    // mysql.query(result, data, (err, rows) => {
    //   if (err) {
    //     console.error("err : " + err);
    //   } else {
    //     console.log("rows: " + JSON.stringify(rows));
  
    //     res.send("<script>alert('상품등록완료.');location.href='/';</script>");
    //   }
    // });
    res.send("<script>alert('상품등록완료.');location.href='/';</script>");
  });



/* GET 상품 확인 page. */
router.get('/read/:id', async (req,res,next) => {
    const id = req.params.id;
      const result = await mysql.query("readImage", id);
      // console.log("read"+result[0].name);
    // mysql.query(result, [id], (err, row) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     res.render('index/productRead', { title: "상품 조회", row: row[0] });
    //   }
    // });
    res.render('index/productRead', { title: "상품 조회", row: result[0] });
});

module.exports = router;