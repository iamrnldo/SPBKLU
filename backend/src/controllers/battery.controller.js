const Battery = require('../models/battery.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get all batteries list (Admin Only)
 */
const getAllBatteries = async (req, res, next) => {
  try {
    const batteries = await Battery.findAll();
    return sendSuccess(res, 'Batteries list retrieved successfully', batteries);
  } catch (error) {
    next(error);
  }
};

/**
 * Get battery diagnostics/detail
 */
const getBatteryDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const battery = await Battery.findByPk(id);

    if (!battery) {
      return sendError(res, 'Battery not found', 404);
    }

    return sendSuccess(res, 'Battery diagnostics details retrieved', battery);
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new battery into the ecosystem
 */
const createBattery = async (req, res, next) => {
  try {
    const { id, type, stateOfHealth } = req.body;

    if (!id || !type) {
      return sendError(res, 'Battery ID and Type are required', 400);
    }

    const exists = await Battery.findByPk(id);
    if (exists) {
      return sendError(res, `Battery ID ${id} is already registered`, 400);
    }

    const newBattery = await Battery.create({
      id,
      type,
      chargeLevel: 100, // starts full
      stateOfHealth: parseInt(stateOfHealth) || 100,
      currentStationId: null,
      currentUserId: null,
      status: 'idle'
    });

    return sendSuccess(res, 'Battery registered successfully', newBattery, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBatteries,
  getBatteryDetail,
  createBattery
};
