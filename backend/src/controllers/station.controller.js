const Station = require('../models/station.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get all stations
 */
const getAllStations = async (req, res, next) => {
  try {
    const stations = await Station.findAll();
    return sendSuccess(res, 'Stations retrieved successfully', stations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get station detail by ID
 */
const getStationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id);

    if (!station) {
      return sendError(res, 'Station not found', 404);
    }

    return sendSuccess(res, 'Station detail retrieved successfully', station);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new SPBKLU station (Admin Only)
 */
const createStation = async (req, res, next) => {
  try {
    const { id, name, address, latitude, longitude, slotCount } = req.body;

    if (!id || !name || !address) {
      return sendError(res, 'Station ID, name, and address are required', 400);
    }

    const stationExists = await Station.findByPk(id);
    if (stationExists) {
      return sendError(res, `Station with ID ${id} already exists`, 400);
    }

    // Create empty slots structure in JSONB format
    const slots = [];
    const count = parseInt(slotCount) || 4;
    for (let i = 1; i <= count; i++) {
      slots.push({
        slotId: i,
        batteryId: null,
        status: 'empty',
        chargeLevel: 0
      });
    }

    const newStation = await Station.create({
      id,
      name,
      address,
      latitude: parseFloat(latitude) || 0.0,
      longitude: parseFloat(longitude) || 0.0,
      status: 'active',
      slots
    });

    return sendSuccess(res, 'Station created successfully', newStation, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStations,
  getStationDetail,
  createStation
};
