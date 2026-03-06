const { verifyToken } = require('../utils/jwt');

// 认证中间件
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 提取token（Bearer token格式）
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
    }

    // 验证token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期'
      });
    }

    // 将用户信息添加到请求对象中
    req.user = {
      id: decoded.id,
      level: decoded.level
    };
    // 保持向后兼容
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.level !== '管理员') {
      return res.status(403).json({
        success: false,
        message: '无管理员权限'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 商家权限中间件
const sellerMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.level !== '商家') {
      return res.status(403).json({
        success: false,
        message: '无商家权限'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  sellerMiddleware
};