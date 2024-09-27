const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // ใส่ username ของ MySQL
    password: '', // ใส่ password ของ MySQL
    database: 'footballdb', // ฐานข้อมูลที่ใช้
  });

module.exports = db;