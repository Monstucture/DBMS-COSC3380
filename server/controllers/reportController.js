const ReportService = require('../services/reportService');
const { REPORT_ERRORS } = require('../utils/constants');

class ReportController {
    static async getSalesReport(req, res) {
        try {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);

            const reportData = await ReportService.getSalesReport(startDate, endDate);
            res.json(reportData);
            
        } catch (error) {
            console.error('Controller - getSalesReport error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getInventoryReport(req, res) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
            const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

            // Use the ReportService instead of direct pool queries
            const reportData = await ReportService.getInventoryReport(startDate, endDate);
            res.json(reportData);
            
        } catch (error) {
            console.error('Controller - getInventoryReport error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ReportController;