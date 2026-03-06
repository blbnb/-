const { sequelize } = require('./config/database');
const Book = require('./models/Book');

async function cleanupRedundantBooks() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功\n');

    console.log('=== 开始清理冗余数据 ===\n');

    const allBooks = await Book.findAll({
      paranoid: false
    });

    console.log(`数据库中总共的图书数据: ${allBooks.length} 条`);

    const activeBooks = allBooks.filter(book => book.deleted_at === null);
    const deletedBooks = allBooks.filter(book => book.deleted_at !== null);

    console.log(`活跃图书: ${activeBooks.length} 条`);
    console.log(`已删除图书: ${deletedBooks.length} 条\n`);

    if (deletedBooks.length > 0) {
      console.log('正在永久删除已标记为删除的图书数据...');
      
      const deletedCount = await Book.destroy({
        where: {
          deleted_at: {
            [require('sequelize').Op.ne]: null
          }
        },
        force: true
      });

      console.log(`✓ 成功永久删除 ${deletedCount} 条冗余数据\n`);

      const remainingBooks = await Book.findAll({
        paranoid: false
      });

      console.log(`清理后的数据库图书总数: ${remainingBooks.length} 条`);
      console.log('清理完成！');
    } else {
      console.log('没有需要清理的冗余数据');
    }

    await sequelize.close();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('清理冗余数据时出错:', error);
    process.exit(1);
  }
}

cleanupRedundantBooks();
