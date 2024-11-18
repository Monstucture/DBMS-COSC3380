const { pool } = require('../config/db');
const { customerAnalyticsQueries } = require('../models/customerAnalyticsQueries');

class CustomerAnalyticsService {
    static async getCustomerAnalytics(startDate, endDate) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get overall metrics
            const [overallMetrics] = await connection.query(
                customerAnalyticsQueries.getOverallMetrics,
                [startDate, endDate]
            );

            // Get membership distribution
            const [membershipDistribution] = await connection.query(
                customerAnalyticsQueries.getMembershipDistribution,
                [startDate, endDate]
            );

            // Get top customers
            const [topCustomers] = await connection.query(
                customerAnalyticsQueries.getTopCustomers,
                [startDate, endDate]
            );

            // Get membership transitions
            const [membershipTransitions] = await connection.query(
                customerAnalyticsQueries.getMembershipTransitions,
                [startDate, endDate, startDate, endDate]
            );

            // Get retention by level
            const [retentionByLevel] = await connection.query(
                customerAnalyticsQueries.getRetentionByLevel,
                [startDate, endDate, startDate, endDate]
            );

            // Get points activity
            const [pointsActivity] = await connection.query(
                customerAnalyticsQueries.getPointsActivity,
                [startDate, endDate]
            );

            // Get points usage by category
            const [pointsUsageByCategory] = await connection.query(
                customerAnalyticsQueries.getPointsUsageByCategory,
                [startDate, endDate]
            );

            await connection.commit();

            return {
                ...overallMetrics[0],
                membershipDistribution,
                topCustomers,
                membershipTransitions,
                retentionByLevel,
                pointsActivity,
                pointsUsageByCategory
            };
        } catch (error) {
            await connection.rollback();
            console.error('Error in getCustomerAnalytics:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getCustomerDetails(customerId) {
        try {
            const [customer] = await pool.query(`
                SELECT 
                    c.*,
                    COUNT(DISTINCT t.Transaction_ID) as totalOrders,
                    SUM(t.Total_Price) as totalSpent,
                    AVG(t.Total_Price) as averageOrderValue,
                    MAX(t.Date) as lastOrderDate
                FROM Customer c
                LEFT JOIN Transaction t ON c.Customer_ID = t.Customer_ID
                WHERE c.Customer_ID = ?
                GROUP BY c.Customer_ID
            `, [customerId]);

            if (!customer.length) {
                throw new Error('Customer not found');
            }

            return customer[0];
        } catch (error) {
            console.error('Error in getCustomerDetails:', error);
            throw error;
        }
    }

    static async getCustomerTransactionHistory(customerId, startDate, endDate) {
        try {
            const [transactions] = await pool.query(`
                SELECT 
                    t.*,
                    GROUP_CONCAT(i.Item_Name) as items,
                    COUNT(DISTINCT ti.Item_ID) as itemCount
                FROM Transaction t
                JOIN Transaction_Item ti ON t.Transaction_ID = ti.Transaction_ID
                JOIN Item i ON ti.Item_ID = i.Item_ID
                WHERE t.Customer_ID = ?
                AND t.Date BETWEEN ? AND ?
                GROUP BY t.Transaction_ID
                ORDER BY t.Date DESC
            `, [customerId, startDate, endDate]);

            return transactions;
        } catch (error) {
            console.error('Error in getCustomerTransactionHistory:', error);
            throw error;
        }
    }
}

module.exports = CustomerAnalyticsService;