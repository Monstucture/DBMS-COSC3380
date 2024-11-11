import { api } from '../axios';
import API_CONFIG from '../config';

export const reportService = {

    getSalesReport: async (startDate, endDate) => {
        try {
            const response = await api.get(
                API_CONFIG.ENDPOINTS.REPORTS.SALES,
                {
                    params: {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString()
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    },

    getInventoryReport: async (startDate, endDate) => {
        try {
            const response = await api.get(
                API_CONFIG.ENDPOINTS.REPORTS.INVENTORY,
                {
                    params: {
                        startDate: startDate,
                        endDate: endDate
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory report:', error);
            throw error;
        }
    }
};