const xlsx = require('xlsx');
const path = require('path');

// 读取 Excel 文件
const excelPath = path.join(__dirname, '..', 'resourse', '2025-2026年第二学期电子科大中山学院教材计划明细（计算机学院）.xlsx');
console.log('正在读取 Excel 文件:', excelPath);

const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 将 Excel 数据转换为 JSON，指定第一行作为表头
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log(`\n共读取 ${data.length} 行数据`);

// 显示表头
console.log('\n表头 (第1行):');
console.log(data[0]);

// 显示前5行数据
console.log('\n前5行数据:');
for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
  console.log(`\n第${i}行:`);
  console.log(data[i]);
}
