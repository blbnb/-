const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Address = require('../models/Address');
const { authMiddleware } = require('../middleware/auth');

// 添加地址接口
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      province,
      city,
      district,
      detailAddress,
      isDefault
    } = req.body;

    // 开始事务
    const transaction = await sequelize.transaction();

    try {
      // 如果设置为默认地址，先将该用户的其他地址设置为非默认
      if (isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId: req.userId } },
          { transaction }
        );
      }

      // 创建新地址
      const address = await Address.create(
        {
          userId: req.userId,
          name,
          phone,
          province,
          city,
          district,
          detailAddress,
          isDefault
        },
        { transaction }
      );

      // 提交事务
      await transaction.commit();

      res.status(201).json({
        success: true,
        message: '地址添加成功',
        data: address
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 更新地址接口
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      province,
      city,
      district,
      detailAddress,
      isDefault
    } = req.body;

    // 查找地址
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    // 检查是否是用户自己的地址
    if (address.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权修改此地址'
      });
    }

    // 开始事务
    const transaction = await sequelize.transaction();

    try {
      // 如果设置为默认地址，先将该用户的其他地址设置为非默认
      if (isDefault && !address.isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId: req.userId, id: { [Op.ne]: req.params.id } } },
          { transaction }
        );
      }

      // 更新地址
      await address.update(
        {
          name,
          phone,
          province,
          city,
          district,
          detailAddress,
          isDefault
        },
        { transaction }
      );

      // 提交事务
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: '地址更新成功',
        data: address
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 删除地址接口
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    // 检查是否是用户自己的地址
    if (address.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除此地址'
      });
    }

    // 删除地址
    await address.destroy();

    res.status(200).json({
      success: true,
      message: '地址删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取地址列表接口
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.userId },
      order: [
        [{ model: Address, as: 'default' }, 'isDefault', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 设置默认地址接口
router.put('/set-default/:id', authMiddleware, async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    // 检查是否是用户自己的地址
    if (address.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权操作此地址'
      });
    }

    // 开始事务
    const transaction = await sequelize.transaction();

    try {
      // 将该用户的所有地址设置为非默认
      await Address.update(
        { isDefault: false },
        { where: { userId: req.userId } },
        { transaction }
      );

      // 将指定地址设置为默认
      await address.update({ isDefault: true }, { transaction });

      // 提交事务
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: '设置默认地址成功'
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

module.exports = router;