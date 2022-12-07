module.exports = {
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    userUpdate : 'UPDATE user SET name=?, email=?, phonenum=? WHERE id=?',
    cateProduct : 'SELECT * FROM product WHERE category=?',
    productWrite : 'Insert into product(name,sellerId,category,detail,price,thumbnailimageurl,detailimageurl,fileurl) value (?,?,?,?,?,?,?,?)',
    productlisRead : 'select * from product where id=?',
    readImage : 'SELECT id, name, category, detail, price, thumbnailimageurl, detailimageurl, fileurl FROM product WHERE id=?',
    // diaryProduct : 'SELECT name, imageurl FROM product WHERE category=1'
    diaryProduct : 'SELECT * FROM product WHERE category = 1',
    noteProduct : 'SELECT * FROM product WHERE category = 2',
    stickerProduct : 'SELECT * FROM product WHERE category = 3',
    wpaperProduct : 'SELECT * FROM product WHERE category = 4',

    // productRead : 'select * from product ',
    productRead : 'select * from product where sellerId=?',
    productUpdate : 'update product set name=?, category=?, thumbnailimageurl=?, fileurl=?, detail=?, detailimageurl=?, price=? where id=?' ,
    productDelete : 'delete from product where id=?',
    qnaWrite : 'Insert into qnaboard(name,password,title,content,date,lock_post,userId) value (?,?,?,?,?,?,?)',
    qnaListRead : 'select * from qnaboard ',
    qnaDetRead : 'select * from qnaboard where id=? ',
    myqnaRead : 'select * from qnaboard where userId=?',
    addPoint: 'update user set point = point + ? where id = ?',
    minusPoint: 'update user set point = point - ? where id = ?',
    readPoint : 'select point from user where id=?',
    qnaDelete: 'delete from qnaboard where id=?',
    newPurchase : 'insert into purchase(productId,userId,productName) value (?,?,?)',
    purchaseRead : 'select * from purchase where userId=?',
    mypurchaseRead : 'select * from purchase where productId=? and userId=?',
    

};