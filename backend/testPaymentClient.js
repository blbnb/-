const http = require('http');

const testPayment = () => {
  const data = JSON.stringify({
    orderId: 'test_order_123',
    paymentMethod: 'wechat',
    paymentPassword: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/payment/pay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('响应状态:', res.statusCode);
      console.log('响应数据:', JSON.parse(body));
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error.message);
  });

  req.write(data);
  req.end();
};

const testWrongPassword = () => {
  const data = JSON.stringify({
    orderId: 'test_order_456',
    paymentMethod: 'wechat',
    paymentPassword: '000000'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/payment/pay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('\n测试错误密码:');
      console.log('响应状态:', res.statusCode);
      console.log('响应数据:', JSON.parse(body));
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error.message);
  });

  req.write(data);
  req.end();
};

console.log('开始测试支付功能...\n');
setTimeout(() => {
  testPayment();
  setTimeout(() => {
    testWrongPassword();
  }, 1000);
}, 1000);
