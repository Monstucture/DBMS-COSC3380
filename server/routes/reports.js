const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authMiddleware, isStrictAdmin } = require('../middlewares/auth');

// Sales Report
router.get('/sales', authMiddleware, isStrictAdmin, ReportController.getSalesReport);

// Inventory Sale Report
router.get('/inventory', authMiddleware, isStrictAdmin, ReportController.getInventoryReport);

module.exports = router;