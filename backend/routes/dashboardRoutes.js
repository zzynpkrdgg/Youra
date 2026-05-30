const express = require("express");
const router = express.Router();
const { getAdminDashboardStats } = require("../controllers/dashboardController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/admin", protect, admin, getAdminDashboardStats);

module.exports = router;
