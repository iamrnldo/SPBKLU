const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Battery = sequelize.define('Battery', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true, // e.g. 'BT-101'
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // e.g. '60V/20Ah'
  },
  chargeLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false
  },
  stateOfHealth: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false
  },
  currentStationId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'stations',
      key: 'id'
    }
  },
  currentUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('ready', 'charging', 'in-use', 'faulty', 'idle'),
    defaultValue: 'idle',
    allowNull: false
  }
}, {
  tableName: 'batteries'
});

module.exports = Battery;
