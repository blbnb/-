const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  orderNo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sellerId: {
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
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'received', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  paymentTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippingTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completionTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'orders',
  indexes: [
    {
      unique: true,
      fields: ['orderNo']
    },
    {
      fields: ['buyerId']
    },
    {
      fields: ['sellerId']
    },
    {
      fields: ['bookId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Order;