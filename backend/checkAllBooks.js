const { sequelize } = require('./config/database');
const Book = require('./models/Book');

async function checkAllBooks() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功\n');

    console.log('=== 检查所有图书数据（包括已删除） ===');
    
    const allBooks = await Book.findAll({
      paranoid: false
    });

    console.log(`数据库中总共的图书数据（包括已删除）: ${allBooks.length} 条\n`);

    if (allBooks.length > 0) {
      console.log('=== 数据统计 ===');
      
      const activeBooks = allBooks.filter(book => book.deleted_at === null);
      const deletedBooks = allBooks.filter(book => book.deleted_at !== null);
      
      console.log(`活跃图书: ${activeBooks.length} 条`);
      console.log(`已删除图书: ${deletedBooks.length} 条\n`);

      if (deletedBooks.length > 0) {
        console.log('=== 已删除的图书列表 ===');
        deletedBooks.forEach((book, index) => {
          console.log(`${index + 1}. ${book.title} - ${book.author} - ¥${book.price} - 删除时间: ${book.deleted_at}`);
        });
        console.log('');
      }

      console.log('=== 活跃图书列表 ===');
      activeBooks.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title} - ${book.author} - ¥${book.price}`);
      });
    }

    await sequelize.close();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('检查图书数据时出错:', error);
    process.exit(1);
  }
}

checkAllBooks();
