import { api } from '../axios.js';
import API_CONFIG from '../config';

export const customerService = {
  getAccount: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CUSTOMER.ACCOUNT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CUSTOMER.ORDERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getAvailableCoupons: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CUSTOMER.COUPONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  register: async (customerData) => {
    try {
      const response = await api.post(
        API_CONFIG.ENDPOINTS.CUSTOMER.REGISTER, 
        {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phoneNumber: customerData.phoneNumber,
          dateOfBirth: customerData.dateOfBirth,
          address: customerData.address
        }
      );
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  placeOrder: async (orderData) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CUSTOMER.ORDERS, {
        items: orderData.items,
        total: orderData.total,
        paymentType: 'Credit Card', // Hard code credit card TODO fix later
        discountPercentage: orderData.selectedCoupon?.Discount_Percentage || 0,
        discountAmount: orderData.selectedCoupon?.Discount_Amount || 0,
        promotionId: orderData.promotionId || null
      });
      return response.data;
    } catch (error) {
      console.error('Order placement error:', error);
      throw error;
    }
  },
  
  // TODO
  placeGuestOrder: async (orderData) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CUSTOMER.GUEST_ORDERS, orderData);
      return response.data;
    } catch (error) {
      console.error('Guest order error:', error);
      throw error;
    }
  },

  updateAccount: async (customerData) => {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.CUSTOMER.ACCOUNT, customerData);
      return response.data;
    } catch (error) {
      console.error('Account update error:', error);
      throw error;
    }
  },

  calculateMembershipDiscount: async (totalAmount) => {
    try {
      const accountData = await customerService.getAccount();
      let discountPercentage = 0;
      
      // Apply discounts based on membership level
      switch (accountData.Membership_Level) {
        case 'Silver':
          discountPercentage = accountData.items >= 4 ? 5 : 0;
          break;
        case 'Gold':
          discountPercentage = accountData.items >= 4 ? 5 : 0;
          // Additional birthday month check could be added here
          break;
        case 'Diamond':
          discountPercentage = accountData.items >= 4 ? 5 : 0;
          // Additional perks could be added here
          break;
        default: // Bronze
          discountPercentage = 0;
      }

      return {
        discountPercentage,
        discountAmount: (totalAmount * discountPercentage) / 100
      };
    } catch (error) {
      console.error('Error calculating membership discount:', error);
      return { discountPercentage: 0, discountAmount: 0 };
    }
  }

};