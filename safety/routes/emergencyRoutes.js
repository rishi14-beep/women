const express = require('express');
const router = express.Router();

const emergencyController = require('../controllers/emergencyController');
const authMiddleware = require('../server/middleware/authMiddleware');

// Protected route to trigger emergency SMS
router.post('/trigger', authMiddleware, emergencyController.triggerEmergency);

module.exports = router;
