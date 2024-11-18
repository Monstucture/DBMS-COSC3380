const { pool } = require('../config/db');
const { REPORT_ERRORS } = require('../utils/constants');
const { reportQueries } = require('../models/reportQueries');

class ReportService {
    static async getSalesReport(startDate, endDate) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get sales data
            const [salesData] = await connection.query(
                reportQueries.getSalesData,
                [startDate, endDate]
            );

            // Get top selling items
            const [topSellingItems] = await connection.query(
                reportQueries.getTopSellingItems,
                [startDate, endDate]
            );

            // Get detailed sales data
            const [detailedData] = await connection.query(
                reportQueries.getSalesDetailsData,
                [startDate, endDate]
            );

            // Parse the JSON string in items field
            const parsedDetailedData = detailedData.map(row => ({
                ...row,
                items: JSON.parse(`[${row.items}]`)
            }));

            // Calculate summary statistics
            const summary = {
                totalRevenue: salesData.reduce((sum, day) => sum + Number(day.revenue), 0),
                totalProfit: salesData.reduce((sum, day) => sum + Number(day.profit), 0),
                totalOrders: salesData.reduce((sum, day) => sum + Number(day.orders), 0),
                averageOrderValue: salesData.length > 0 
                    ? salesData.reduce((sum, day) => sum + Number(day.revenue), 0) / 
                      salesData.reduce((sum, day) => sum + Number(day.orders), 0)
                    : 0,
                topSellingItems: topSellingItems.map(item => ({
                    ...item,
                    revenue: Number(item.revenue),
                    profit: Number(item.profit)
                }))
            };

            await connection.commit();
            return {
                salesData: salesData.map(day => ({
                    ...day,
                    revenue: Number(day.revenue),
                    profit: Number(day.profit),
                    orders: Number(day.orders)
                })),
                detailedData: parsedDetailedData,
                summary
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error in getSalesReport:', error);
            throw new Error(REPORT_ERRORS.SALES_REPORT_ERROR);
        } finally {
            connection.release();
        }
    }

    static async getInventoryReport(startDate, endDate) {
        try {
            const [inventoryData] = await pool.query(
                reportQueries.getInventoryReport,
                [startDate, endDate]
            );

            return inventoryData;
        } catch (error) {
            console.error('Error in getInventoryReport:', error);
            throw new Error(REPORT_ERRORS.INVENTORY_REPORT_ERROR);
        }
    }
}

module.exports = ReportService;