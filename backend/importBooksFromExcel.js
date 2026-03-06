const xlsx = require('xlsx');
const { sequelize } = require('./config/database');
const Book = require('./models/Book');
const path = require('path');

async function importBooksFromExcel() {
  try {
    // 读取 Excel 文件
    const excelPath = path.join(__dirname, '..', 'resourse', '2025-2026年第二学期电子科大中山学院教材计划明细（计算机学院）.xlsx');
    console.log('正在读取 Excel 文件:', excelPath);
    
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 将 Excel 数据转换为 JSON，指定第一行作为表头
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`成功读取 ${data.length} 行数据`);
    
    // 同步数据库
    await sequelize.sync();
    console.log('数据库同步成功');
    
    // 清空现有图书数据（保留用户数据）
    await Book.destroy({ where: {}, truncate: true });
    console.log('已清空现有图书数据');
    
    // 跳过前两行（标题和表头），转换数据格式并去重
    const booksMap = new Map(); // 使用 Map 去重，key 为书名+作者
    
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // 根据列索引获取数据
      // 0:教学单位, 1:学生学院, 2:使用班级, 3:课程名称, 4:教材编码, 
      // 5:教材名称, 6:出版社, 7:作者, 8:参考定价, 9:备注
      const bookName = row[5];
      if (!bookName || bookName === '教材名称' || typeof bookName !== 'string') continue;
      
      const author = row[7] ? String(row[7]).trim() : '未知作者';
      const key = `${String(bookName).trim()}_${author}`; // 书名+作者作为唯一键
      
      if (!booksMap.has(key)) {
        const book = {
          id: generateUUID(),
          title: String(bookName).trim(),
          author: author,
          ISBN: row[4] ? String(row[4]).trim() : null,
          price: parseFloat(row[8]) || 0,
          originalPrice: parseFloat(row[8]) || null,
          category: row[3] ? String(row[3]).trim() : '计算机',
          college: row[1] ? String(row[1]).trim() : '计算机学院',
          description: row[9] ? String(row[9]).trim() : `${row[6] || '电子科大中山学院计算机学院教材'}`,
          condition: '全新',
          status: '在售',
          sellerId: '22222222-2222-2222-2222-222222222222'
        };
        
        booksMap.set(key, book);
      }
    }
    
    const booksToInsert = Array.from(booksMap.values());
    console.log(`\n去重后准备插入 ${booksToInsert.length} 本图书到数据库...`);
    
    if (booksToInsert.length > 0) {
      // 批量插入数据
      await Book.bulkCreate(booksToInsert);
      console.log('教材数据导入成功！');
      console.log(`共导入 ${booksToInsert.length} 本图书（已去重）`);
      
      // 显示导入的图书列表
      console.log('\n导入的图书列表:');
      booksToInsert.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title} - ${book.author} - ¥${book.price}`);
      });
    } else {
      console.log('没有有效的图书数据需要导入');
    }
    
  } catch (error) {
    console.error('导入教材数据失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// 生成 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

importBooksFromExcel();
