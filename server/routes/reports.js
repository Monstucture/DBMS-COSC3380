const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const CustomerAnalyticsController = require('../controllers/customerAnalyticsController');
const { authMiddleware, isStrictAdmin } = require('../middlewares/auth');

// Sales Report
router.get('/sales', authMiddleware, isStrictAdmin, ReportController.getSalesReport);

// Inventory Sale Report
router.get('/inventory', authMiddleware, isStrictAdmin, ReportController.getInventoryReport);

// Customer analytics
router.get('/analytics', authMiddleware, isStrictAdmin, CustomerAnalyticsController.getAnalytics);
router.get('/customer/:customerId', authMiddleware, isStrictAdmin, CustomerAnalyticsController.getCustomerDetails);
router.get('/customer/:customerId/transaction', authMiddleware, isStrictAdmin, CustomerAnalyticsController.getCustomerTransactions);

module.exports = router;