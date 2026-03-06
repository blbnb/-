// 加载环境变量
require('dotenv').config();

// 导入并启动应用
const { startServer } = require('./app');

// 启动服务器
startServer();