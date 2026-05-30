const User = require('../models/user.model');
const Station = require('../models/station.model');
const Battery = require('../models/battery.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get dashboard stats for Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Perform database count queries
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalStations = await Station.count();
    const totalBatteries = await Battery.count();
    const totalTransactions = await Transaction.count();
    
    // Calculate total revenue from completed transactions
    const totalRevenue = await Transaction.sum('cost', { where: { status: 'completed' } }) || 0;

    const operationalRate = "99.2%"; // KPI simulation

    return sendSuccess(res, 'Admin statistics fetched successfully', {
      statistics: {
        totalUsers,
        totalStations,
        totalBatteries,
        totalTransactions,
        operationalRate,
        revenueThisMonth: totalRevenue
      },
      chartData: {
        monthlyTransactions: [12, 28, 48, 62, 98, totalTransactions],
        monthlyRevenue: [120000, 280000, 480000, 620000, 980000, totalRevenue]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registered users list
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'balance', 'createdAt']
    });

    return sendSuccess(res, 'Users list retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * Top up another user's balance directly (Admin only)
 */
const topUpUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid top-up amount', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.balance += parseInt(amount);
    await user.save();

    return sendSuccess(res, `Berhasil mengisi saldo untuk ${user.name}`, {
      userId: user.id,
      name: user.name,
      newBalance: user.balance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  topUpUser
};
