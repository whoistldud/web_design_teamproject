module.exports = {
    userVertifyId : `select id from user where id = ?`,
    userJoin : 'Insert into user value (?,?,?,?,?,?,?)',
    userLogin : 'select * from user where id = ?',
    // diaryProduct : 'SELECT name, imageurl FROM product WHERE category=1'
    diaryProduct : 'SELECT * FROM product WHERE category = 1',
    noteProduct : 'SELECT * FROM product WHERE category = 2',
    stickerProduct : 'SELECT * FROM product WHERE category = 3',
    wpaperProduct : 'SELECT * FROM product WHERE category = 4',

};