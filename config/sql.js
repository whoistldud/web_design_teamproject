module.exports = {
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    userUpdate : 'UPDATE user SET name=?, email=?, phonenum=? WHERE id=?',
    cateProduct : 'SELECT * FROM product WHERE category=?',
    productWrite : 'Insert into product(name,sellerId,category,detail,price,imageurl) value (?,?,?,?,?,?)',
    productlisRead : 'select * from product where id=?',
    readImage : 'SELECT id, name, category, detail, price, imageurl FROM product WHERE id=?',
    // diaryProduct : 'SELECT name, imageurl FROM product WHERE category=1'
    diaryProduct : 'SELECT * FROM product WHERE category = 1',
    noteProduct : 'SELECT * FROM product WHERE category = 2',
    stickerProduct : 'SELECT * FROM product WHERE category = 3',
    wpaperProduct : 'SELECT * FROM product WHERE category = 4',

    // productRead : 'select * from product ',
    productRead : 'select * from product where sellerId=?',
    productDelete : 'delete from product where id=?',
    qnaWrite : 'Insert into qnaboard(name,password,title,content,date,lock_post,userId) value (?,?,?,?,?,?,?)',
    qnaListRead : 'select * from qnaboard ',
    qnaDetRead : 'select * from qnaboard where id=? ',
    myqnaRead : 'select * from qnaboard where userId=?',
    addPoint: 'update user set point = point + ? where id = ?',
    readPoint : 'select point from user where id=?',
    qnaDelete: 'delete from qnaboard where id=?',

    //chat
    enterRoom : 'select * from chatroom where productId = ? and (sellerId = ? or userId = ?)',
    createRoom : 'Insert into chatroom(productId, sellerId, userId) value (?,?,?)',
    findSeller : 'select sellerId from product where id = ?',
    checkRoom : 'select  * from chatroom where chatroomId = ? and (sellerId = ? or userId = ?)',
    chat : 'Insert into chat(chatroomId, senderId, message, createdDate) value (?,?,?,?)',
    chatroom : 'select * from chat where chatroomId = ?',
    chatroomList : 'select * from chatroom where sellerId = ? or userId = ?',

    //draw
    saveImage : 'Update work set Imageurl = ? where workId = 1',
    
};