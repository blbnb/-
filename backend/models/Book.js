const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ISBN: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  college: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condition: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '八成新'
  },
  status: {
    type: DataTypes.ENUM('在售', '已售出', '下架'),
    defaultValue: '在售'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favoriteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'books',
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['author']
    },
    {
      fields: ['category']
    },
    {
      fields: ['college']
    },
    {
      fields: ['sellerId']
    }
  ]
});

module.exports = Book;