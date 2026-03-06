const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    // 连接到 MySQL 服务器
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('成功连接到 MySQL 服务器');

    // 检查数据库是否存在
    const [databases] = await connection.execute(
      `SHOW DATABASES LIKE '${process.env.DB_NAME}'`
    );

    if (databases.length === 0) {
      console.log(`数据库 ${process.env.DB_NAME} 不存在`);
    } else {
      console.log(`数据库 ${process.env.DB_NAME} 存在`);

      // 关闭当前连接，重新连接到指定数据库
      await connection.end();
      const dbConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      });

      // 检查 books 表是否存在
      const [tables] = await dbConnection.execute(
        "SHOW TABLES LIKE 'books'"
      );

      if (tables.length === 0) {
        console.log('books 表不存在');
      } else {
        console.log('books 表存在');

        // 检查 books 表中的数据
        const [books] = await dbConnection.execute('SELECT * FROM books');
        console.log(`books 表中有 ${books.length} 条数据`);
        console.log('图书数据:');
        books.forEach((book, index) => {
          console.log(`${index + 1}. ${book.title} - ${book.author} - ¥${book.price}`);
        });
      }

    }

    // 关闭连接
    if (dbConnection) {
      await dbConnection.end();
    }
  } catch (error) {
    console.error('数据库检查失败:', error.message);
  }
}

checkDatabase();