const axios = require('axios');

// 测试管理员登录
async function testAdminLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/admin/login', {
      phone: '13800138000',
      password: 'admin123'
    });
    console.log('管理员登录成功:', response.data);
  } catch (error) {
    console.error('管理员登录失败:', error.response ? error.response.data : error.message);
  }
}

// 测试商家登录
async function testSellerLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/seller/login', {
      phone: '13900139001',
      password: 'seller123'
    });
    console.log('商家登录成功:', response.data);
  } catch (error) {
    console.error('商家登录失败:', error.response ? error.response.data : error.message);
  }
}

// 运行测试
testAdminLogin();
testSellerLogin();