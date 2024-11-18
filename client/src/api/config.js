const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'production'
      ? 'https://dbms-cosc-3380.vercel.app'
      : 'http://localhost:5000',
    ENDPOINTS: {
      AUTH: {
        CUSTOMER_LOGIN: '/auth/customer/login',
        ADMIN_LOGIN: '/auth/admin/login',
        EMPLOYEE_LOGIN: '/auth/employee/login'

      },
      CUSTOMER: {
        ACCOUNT: '/acc/customer/account',
        ORDERS: '/acc/customer/orders',
        GUEST_ORDER: '/acc/guest-orders',
        REGISTER: '/acc/customer/register',
        COUPONS: '/acc/customer/coupons'
      },
      SHOP: {
        FLAVORS: '/shop/all-flavors',
        INVENTORY_LOGS: '/shop/inventory-logs',
      },
      REPORTS: {
        SALES: '/reports/sales',
        INVENTORY: '/reports/inventory',
        ANALYTICS: '/reports/analytics',
        CUSTOMER:  '/reports/customer'
      }
    },
    HEADERS: {
      DEFAULT: {
        'Content-Type': 'application/json'
      }
    }
  };
  
  export default API_CONFIG;