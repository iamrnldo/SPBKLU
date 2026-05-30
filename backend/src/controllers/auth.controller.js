const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register mobile user
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return sendError(res, 'Email already registered', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User in database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      balance: 0
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return sendSuccess(res, 'User registered successfully', {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        balance: newUser.balance
      },
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * General Login (Admin & User)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Find user in PostgreSQL
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Sign Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return sendSuccess(res, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  login
};
