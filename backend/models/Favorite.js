const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  }
}, {
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['bookId']
    }
  ]
});

module.exports = Favorite;