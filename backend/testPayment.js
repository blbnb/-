const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/payment/pay', (req, res) => {
  const { orderId, paymentMethod, paymentPassword } = req.body;
  
  console.log('收到支付请求:', {
    orderId,
    paymentMethod,
    paymentPassword
  });
  
  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: '订单ID不能为空'
    });
  }
  
  const correctPassword = '123456';
  
  if (paymentPassword !== correctPassword) {
    return res.status(400).json({
      success: false,
      message: '支付密码错误'
    });
  }
  
  res.status(200).json({
    success: true,
    message: '支付成功',
    data: {
      orderId: orderId,
      status: 'paid',
      paymentMethod: paymentMethod || 'wechat',
      paymentTime: new Date().toISOString()
    }
  });
});

app.get('/api/payment/status/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  res.status(200).json({
    success: true,
    data: {
      orderId: orderId,
      status: 'paid',
      paymentMethod: 'wechat',
      paymentTime: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log('支付密码: 123456');
});
