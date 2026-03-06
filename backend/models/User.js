const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nickName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  college: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  level: {
    type: DataTypes.ENUM('普通用户', '商家', '管理员'),
    defaultValue: '普通用户'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  openid: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['phone']
    },
    {
      unique: true,
      fields: ['openid']
    }
  ]
});

module.exports = User;