const { sequelize } = require('./config/database');
const Book = require('./models/Book');

async function checkBooks() {
  try {
    await sequelize.sync();
    const books = await Book.findAll();
    console.log('数据库中的图书数据:', books.length, '本');
    console.log('图书列表:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - ${book.author} - ¥${book.price}`);
    });
  } catch (error) {
    console.error('检查图书数据失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkBooks();