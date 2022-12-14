const { useDebugValue } = require("react");

module.exports = {
    //user
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    userUpdate : 'UPDATE user SET name=?, email=?, phonenum=? WHERE id=?',
    userName : 'select name from user where id=?',

    //product
    productAll : "select * from product where state = 'y' ",
    cateProduct : "SELECT * FROM product where state = 'y'",
    productWrite : 'Insert into product(name,sellerId,category,detail,price,thumbnailimageurl,detailimageurl,fileurl) value (?,?,?,?,?,?,?,?)',
    productlisRead : "select * from product where id=? ",
    readImage : 'SELECT id, name, category, detail, price, thumbnailimageurl, detailimageurl, fileurl, state FROM product WHERE id=?',
    diaryProduct : "SELECT * FROM product WHERE category = 1 and state = 'y'",
    noteProduct : "SELECT * FROM product WHERE category = 2 and state = 'y'",
    stickerProduct : "SELECT * FROM product WHERE category = 3 and state = 'y'",
    wpaperProduct : "SELECT * FROM product WHERE category = 4 and state = 'y'",
    productRead : 'select * from product where sellerId=?',
    productUpdate : 'update product set name=?, category=?, thumbnailimageurl=?, fileurl=?, detail=?, detailimageurl=?, price=? where id=?' ,
    productDelete : 'delete from product where id=?',
    aroundprod : "select id,sellerId,name,price,thumbnailimageurl from product where sellerId=? and state = 'y'",

    //QNA
    qnaWrite : 'Insert into qnaboard(name,password,title,content,date,lock_post,userId) value (?,?,?,?,?,?,?)',
    qnaListRead : 'select * from qnaboard ',
    qnaDetRead : 'select * from qnaboard where id=? ',
    myqnaRead : 'select * from qnaboard where userId=?',
    qnaDelete: 'delete from qnaboard where id=?',

    //Point
    addPoint: 'update user set point = point + ? where id = ?',
    minusPoint: 'update user set point = point - ? where id = ?',
    readPoint : 'select point from user where id=?',
    addreviewPoint : 'update user set point = point + 2000 where id = ?',

    //chat
    enterRoom : 'select * from chatroom where productId = ? and (sellerId = ? or userId = ?)',
    createRoom : 'Insert into chatroom(productId, sellerId, userId) value (?,?,?)',
    findSeller : 'select sellerId from product where id = ?',
    checkRoom : 'select  * from chatroom where chatroomId = ? and (sellerId = ? or userId = ?)',
    chat : 'Insert into chat(chatroomId, senderId, message, createdDate) value (?,?,?,?)',
    chatroom : 'select * from chat where chatroomId = ? order by createdDate desc',
    chatroomList : 'select * from chatroom where sellerId = ? or userId = ?',

    //draw
    saveImage : 'Update work set Imageurl = ? where workId = ?',
    setImage : 'Select * from work where workId = ? and private = 1',
    setdrawImage : 'Select * from work where workId = ?',
    workRoomList : 'Select * from work',
    searchworkRoomList : 'Select * from work where title like ? and private = 1',
    creatework : 'Insert work(title,sellerId,maximum,private) value (?,?,?,?)',
    updateMember : 'update work set currentnum = currentnum + 1, participants = ? where workid = ?',
    workchatroom : 'select * from workchat where workroomId = ? order by createdDate desc',
    drawchat : 'Insert into workchat(workroomId, senderId, message, createdDate) value (?,?,?,?)',
    sellerwork : 'Select * from work where sellerId = ?',


    //purchase
    newPurchase : 'insert into purchase(productId,userId,productName) value (?,?,?)',
    purchaseRead : 'select * from purchase where userId=?',
    purchaseIdRead : 'select * from purchase where id=?',
    newPurchase : 'insert into purchase(productId,userId,productName,date,downEndDate) value (?,?,?,?,?)',
    purchaseRead : 'select * from purchase where userId=?',
    mypurchaseRead : 'select * from purchase where id=? and userId=?',

    //cart
    mycartList : 'SELECT * from cart where userId=?',
    intoMycart : 'INSERT INTO cart(userId,productId,prodName) value (?,?,?)',
    outofcart : 'delete from cart where productId=? and userId=?',

    //search
    search : 'select * from product where name like ? or sellerId like ?',

    //review
    reiviewWrite : 'insert into review(userId,productId,content,star,date,purchaseId) value(?,?,?,?,?,?)',
    reviewRead : 'select * from review where productId=? and purchaseId=?',
    reviewlis : 'select * from review where productId=?',
    reviewMyRead : 'select * from review where purchaseId=?',
    reviewDelete : 'delete from review where id=?',

    // withdrawal
    deletecart : 'delete from cart where userId = ?',
    deletechatroom : 'delete from chatroom where userId = ?',
    deletechat : 'delete from chat where chatroomId = ?',
    deleteuser : 'delete from user where id =?',
    updatechatstate : 'update chatroom set state = "n" where sellerId = ?',
    productstate : 'update product set state = "n" where sellerId = ?',
    deleteworkchat : 'delete from workchat where workroomId = ?',
    deletworkroom : 'delete from work where sellerId = ?',



};