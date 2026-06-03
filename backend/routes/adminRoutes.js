const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminAuth } = require('../middleware/adminAuth');
const { getDashboardStats } = require('../controllers/adminController');

router.get('/dashboard', protect, adminAuth, getDashboardStats);

module.exports = router;
