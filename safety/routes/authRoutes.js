const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../server/middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getProfile);
router.post('/contacts', authMiddleware, authController.addContact);

module.exports = router;
