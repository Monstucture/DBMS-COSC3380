const CustomerAnalyticsService = require('../services/customerAnalyticsService');

class CustomerAnalyticsController {
    static async getAnalytics(req, res) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
            const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
            
            const analyticsData = await CustomerAnalyticsService.getCustomerAnalytics(
                startDate,
                endDate
            );

            res.json(analyticsData);
        } catch (error) {
            console.error('Controller - getAnalytics error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getCustomerDetails(req, res) {
        try {
            const { customerId } = req.params;
            const customerData = await CustomerAnalyticsService.getCustomerDetails(customerId);
            res.json(customerData);
        } catch (error) {
            console.error('Controller - getCustomerDetails error:', error);
            if (error.message === 'Customer not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async getCustomerHistory(req, res) {
        try {
            const { customerId } = req.params;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
            const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

            const history = await CustomerAnalyticsService.getCustomerTransactionHistory(
                customerId,
                startDate,
                endDate
            );
            res.json(history);
        } catch (error) {
            console.error('Controller - getCustomerHistory error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CustomerAnalyticsController;