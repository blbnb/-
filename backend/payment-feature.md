# 伪支付功能说明

## 功能概述
已为书店系统添加了伪支付功能，用于模拟真实的支付流程。

## 后端实现

### 新增文件
- `backend/routes/paymentRoutes.js` - 支付路由
- `backend/app.js` - 已更新，注册支付路由

### 支付接口
- `POST /api/payment/pay` - 执行支付
  - 参数: orderId, paymentMethod, paymentPassword
  - 支付密码: 123456
  - 返回: 支付结果

- `GET /api/payment/status/:orderId` - 查询支付状态
  - 参数: orderId
  - 返回: 支付状态信息

## 前端实现

### 更新文件
- `pages/checkout/checkout.js` - 结算页面

### 支付流程
1. 用户选择支付方式（微信支付、支付宝、银行卡）
2. 点击"提交订单"按钮
3. 如果选择微信支付，弹出密码输入框
4. 输入6位支付密码（123456）
5. 调用后端支付接口
6. 支付成功后跳转到订单列表

### 支付密码
- 默认支付密码: 123456
- 输入错误密码会提示错误信息
- 支持密码重试

## 测试方法

### 启动后端服务器
```bash
cd backend
npm start
```

### 启动测试服务器（可选）
```bash
cd backend
node testPayment.js
```

### 运行测试客户端
```bash
cd backend
node testPaymentClient.js
```

## 注意事项
1. 这是伪支付功能，仅用于测试和演示
2. 不会进行真实的资金交易
3. 支付密码硬编码为 123456
4. 支付成功后会更新订单状态为已支付
5. 支持多种支付方式选择（微信支付、支付宝、银行卡）

## 功能特点
- 支持密码验证
- 支持支付状态查询
- 支持多种支付方式
- 支付成功后自动跳转
- 支付失败提示错误信息
- 支持未支付订单管理
