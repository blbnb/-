const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// 微信小程序登录接口
router.post('/login', async (req, res) => {
  try {
    const { code, userInfo, phoneData } = req.body;
    console.log('登录请求:', { code, userInfo, phoneData });

    // 如果有code参数，说明是微信小程序授权登录
    if (code) {
      // 参数验证
      if (!code) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少登录凭证' 
        });
      }

      // 这里应该调用微信接口获取openid
      // 由于是模拟环境，我们使用一个模拟的openid（使用code确保一致性）
      const openid = `mock_openid_${code}_${Date.now().toString().substr(-6)}`;
      
      // 查找是否已有该openid对应的用户
      let user = await User.findOne({ where: { openid } });
      
      if (!user) {
        // 如果用户不存在，则创建新用户
        // 模拟解密手机号
        let phone = phoneData ? '13800138000' : null;
        
        user = await User.create({
          openid,
          phone,
          nickName: userInfo?.nickName || '用户' + openid.substring(0, 8),
          avatarUrl: userInfo?.avatarUrl || 'https://picsum.photos/seed/user/200/200',
          college: '未设置',
          level: '普通会员',
          points: 0
        });
        console.log('创建新用户成功:', user.id);
      } else {
        // 更新用户信息
        const updateData = {};
        
        if (userInfo) {
          updateData.nickName = userInfo.nickName || user.nickName;
          updateData.avatarUrl = userInfo.avatarUrl || user.avatarUrl;
        }
        
        // 如果有新的手机号信息，更新手机号
        if (phoneData && !user.phone) {
          updateData.phone = '13800138000'; // 模拟解密的手机号
        }
        
        // 如果有更新数据
        if (Object.keys(updateData).length > 0) {
          await user.update(updateData);
          console.log('更新用户信息成功:', user.id);
        }
      }
      
      // 生成token
      const token = generateToken(user.id);
      
      // 构造返回的用户信息
      const userInfoResponse = {
        id: user.id,
        nickName: user.nickName,
        phone: user.phone,
        college: user.college,
        avatarUrl: user.avatarUrl,
        level: user.level,
        points: user.points
      };
      
      res.status(200).json({
        success: true,
        message: '登录成功',
        data: userInfoResponse,
        token
      });
    } else {
      // 传统手机号密码登录逻辑（保留）
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message: '参数错误'
        });
      }

      // 查找用户
      const user = await User.findOne({ where: { phone } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '密码错误'
        });
      }

      // 生成token
      const token = generateToken(user.id);

      res.status(200).json({
        success: true,
        message: '登录成功',
        data: {
          id: user.id,
          nickName: user.nickName,
          phone: user.phone,
          college: user.college,
          avatarUrl: user.avatarUrl,
          level: user.level,
          points: user.points
        },
        token
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickName, college } = req.body;

    // 检查手机号是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '手机号已被注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = await User.create({
      phone,
      password: hashedPassword,
      nickName,
      college,
      avatarUrl: 'https://example.com/default-avatar.png',
      level: '普通用户',
      points: 0
    });

    // 生成token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: newUser.id,
          nickName: newUser.nickName,
          phone: newUser.phone,
          college: newUser.college,
          avatarUrl: newUser.avatarUrl,
          level: newUser.level,
          points: newUser.points
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取用户信息接口
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'nickName', 'phone', 'college', 'avatarUrl', 'level', 'points']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 更新用户信息接口
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { nickName, avatarUrl, college } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新用户信息
    await user.update({
      nickName: nickName || user.nickName,
      avatarUrl: avatarUrl || user.avatarUrl,
      college: college || user.college
    });

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: {
        id: user.id,
        nickName: user.nickName,
        phone: user.phone,
        college: user.college,
        avatarUrl: user.avatarUrl,
        level: user.level,
        points: user.points
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

module.exports = router;