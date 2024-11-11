const SHOP_ERRORS = {
    ITEM_NOT_FOUND: 'Item not found',
    INVALID_INPUT: 'Invalid input data',
    DB_ERROR: 'Database error occurred',
    CREATE_ERROR: 'Error creating item',
    UPDATE_ERROR: 'Error updating item',
    DELETE_ERROR: 'Error deleting item'
};

const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_REQUIRED: 'Authentication required',
    TOKEN_INVALID: 'Invalid token',
    ADMIN_ACCESS_REQUIRED: 'Admin access required',
    EMPLOYEE_ACCESS_REQUIRED: 'Employee access required',
    SERVER_ERROR: 'Server error during authentication'
};

const CUSTOMER_ERRORS = {
    NOT_FOUND: 'Customer not found',
    INVALID_POINTS: 'Invalid points value',
    INVALID_ROLE: 'Invalid user role',
    UPDATE_FAILED: 'Failed to update customer data',
    ORDERS_NOT_FOUND: 'No orders found for customer',
    ALREADY_EXISTS: 'Customer with this phone number already exists',
    INVALID_INPUT: 'Missing required customer information',
    INSUFFICIENT_STOCK: 'Insufficient stock for one or more items',
    INVALID_COUPON: 'Invalid or expired coupon',
    COUPON_ALREADY_USED: 'Coupon has already been used',
    COUPON_EXPIRED: 'Coupon has expired'
};

const TRANSACTION_ERRORS = {
    INSUFFICIENT_STOCK: 'One or more items are out of stock',
    PAYMENT_FAILED: 'Payment processing failed',
};

const REPORT_ERRORS = {
    SALES_REPORT_ERROR: 'Error generating sales report',
    INVENTORY_REPORT_ERROR: 'Error generating inventory report',
    INVALID_DATE_RANGE: 'Invalid date range provided',
    NO_DATA_AVAILABLE: 'No data available for the specified period'
};

module.exports = {
    SHOP_ERRORS,
    AUTH_ERRORS,
    CUSTOMER_ERRORS,
    TRANSACTION_ERRORS,
    REPORT_ERRORS
};