module.exports = {
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    productWrite : 'Insert into product(name,sellerId,category,detail,price,imageurl) value (?,?,?,?,?,?)',
    productRead : 'select * from product ',
    productlisRead : 'select * from product where id=?',
    readImage : 'SELECT id, name, category, detail, price, imageurl FROM product WHERE id=?',
    qnaWrite : 'Insert into qnaboard(name,password,title,content,date,lock_post) value (?,?,?,?,?,?)',
    // diaryProduct : 'SELECT name, imageurl FROM product WHERE category=1'
    diaryProduct : 'SELECT * FROM product WHERE category = 1',
    noteProduct : 'SELECT * FROM product WHERE category = 2',
    stickerProduct : 'SELECT * FROM product WHERE category = 3',
    wpaperProduct : 'SELECT * FROM product WHERE category = 4',

};