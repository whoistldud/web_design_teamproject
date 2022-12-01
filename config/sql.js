module.exports = {
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    productWrite : 'Insert into product(name,sellerId,category,detail,price,imageurl) value (?,?,?,?,?,?)',
    // productRead : 'select * from product ',
    productRead : 'select * from product where sellerId=?',
    readImage : 'SELECT id, name, category, detail, price, imageurl FROM product WHERE id=?',
    productDelete : 'delete from product where id=?',
    qnaWrite : 'Insert into qnaboard(name,password,title,content,date,lock_post,userId) value (?,?,?,?,?,?,?)',
    qnaListRead : 'select * from qnaboard ',
    qnaDetRead : 'select * from qnaboard where id=? ',
    myqnaRead : 'select * from qnaboard where userId=?',


};