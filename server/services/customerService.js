const { pool } = require('../config/db');
const { CUSTOMER_ERRORS } = require('../utils/constants');
const { customerQueries } = require('../models/customerQueries');
const { transactionQueries } = require('../models/transactionQueries');

class CustomerService {
    static async getCustomerAccount(customerId) {
        try {
            const [customerRows] = await pool.query(
                customerQueries.getCustomerById,
                [customerId]
            );

            if (customerRows.length === 0) {
                throw new Error(CUSTOMER_ERRORS.NOT_FOUND);
            }

            const customerData = customerRows[0];
            const membershipDetails = this.getMembershipDetails(customerData.Membership_Level);

            return {
                ...customerData,
                ...membershipDetails
            };
        } catch (error) {
            console.error('Service - getCustomerAccount error:', error);
            throw error;
        }
    }

    static async getCustomerOrders(customerId) {
        try {
            const [orders] = await pool.query(
                customerQueries.getCustomerOrders,
                [customerId]
            );

            return orders;
        } catch (error) {
            console.error('Service - getCustomerOrders error:', error);
            throw error;
        }
    }

    // GET promotions
    static async getCustomerCoupons(customerId) {
        try {
            const [coupons] = await pool.query(
                customerQueries.getAvailableCoupons,
                [customerId]
            );
            return coupons;
        } catch (error) {
            console.error('Service - getCustomerCoupons error:', error);
            throw error;
        }
    }

    static async validateAndApplyCoupon(connection, customerId, couponId, total) {
        if (!couponId) return { discountPercentage: 0, discountAmount: 0 };

        const [couponRows] = await connection.query(
            customerQueries.getCouponById,
            [couponId, customerId]
        );

        if (!couponRows.length) {
            throw new Error(CUSTOMER_ERRORS.INVALID_COUPON);
        }

        const coupon = couponRows[0];
        let discountAmount = 0;
        let discountPercentage = 0;

        if (coupon.Coupon_Type === 'Birthday') {
            // Find cheapest item logic would be handled in the order calculation
            discountAmount = total;  // We'll apply this to the cheapest item only
        } else if (coupon.Discount_Percentage) {
            discountPercentage = coupon.Discount_Percentage;
        } else if (coupon.Discount_Amount) {
            discountAmount = coupon.Discount_Amount;
        }

        return { discountPercentage, discountAmount, coupon };
    }

    // Handle register user
    static async registerCustomer(customerData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check for existing customer
            const [existing] = await connection.query(
                customerQueries.getCustomerByPhone,
                [customerData.phoneNumber]
            );

            if (existing.length > 0) {
                throw new Error(CUSTOMER_ERRORS.ALREADY_EXISTS);
            }

            // Insert new customer
            const [result] = await connection.query(
                customerQueries.createCustomer,
                [
                    customerData.phoneNumber,
                    customerData.address,
                    customerData.firstName,
                    customerData.lastName,
                    customerData.dateOfBirth
                ]
            );

            const customerId = result.insertId;

            // Get the newly created customer data
            const [newCustomer] = await connection.query(
                customerQueries.getCustomerById,
                [customerId]
            );

            await connection.commit();
            return newCustomer[0];

        } catch (error) {
            await connection.rollback();
            console.error('Service - registerCustomer error:', error);
            throw error;
        } finally {
            connection.release();
        }
    }


    // Place order
    static async placeOrder(customerId, items, total, couponId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
    
            // Create initial transaction
            const [transactionResult] = await connection.query(
                transactionQueries.createTransaction,
                [
                    customerId,         // Customer_ID
                    total,             // Total_Price
                    'Credit Card',     // Payment_Type
                    couponId || null,  // Promotion_ID
                    0,                 // Discount_Percentage
                    0                  // Discount_Amount
                ]
            );
    
            const transactionId = transactionResult.insertId;
        
            // Process each item
            for (const item of items) {
                // Check inventory
                const [inventoryResult] = await connection.query(
                    'SELECT Quantity FROM item WHERE Item_ID = ?',
                    [item.Item_ID]
                );
    
                if (!inventoryResult.length || inventoryResult[0].Quantity < item.quantity) {
                    throw new Error(CUSTOMER_ERRORS.INSUFFICIENT_STOCK);
                }
    
                // Create transaction item
                await connection.query(
                    transactionQueries.createTransactionItem,
                    [transactionId, item.Item_ID, item.quantity]
                );
    
                // Update inventory
                await connection.query(
                    'UPDATE Item SET Quantity = Quantity - ? WHERE Item_ID = ?',
                    [item.quantity, item.Item_ID]
                );
            }
    
            // Handle coupon if provided
            let finalTotal = total;
            let discountAmount = 0;
    
            if (couponId) {
                const [coupons] = await connection.query(
                    'SELECT * FROM Promotions WHERE Promotion_ID = ?',
                    [couponId]
                );
    
                if (coupons.length > 0) {
                    const coupon = coupons[0];
                    // Handle free item coupon
                    if (coupon.Promotion_Type === 'Birthday' || 
                        coupon.Description.includes('Free Ice Cream')) {
                        // Find cheapest item
                        const cheapestItem = items.reduce((min, item) => 
                            item.Unit_Price < min.Unit_Price ? item : min
                        );
                        discountAmount = cheapestItem.Unit_Price;
                        finalTotal -= discountAmount;
                    }
    
                    // Update transaction with final amounts
                    await connection.query(
                        `UPDATE Transaction 
                         SET Total_Price = ?,
                             Discount_Amount = ?
                         WHERE Transaction_ID = ?`,
                        [finalTotal, discountAmount, transactionId]
                    );
                }
            }
    
            // Update points (1 point per dollar)
            const pointsEarned = Math.floor(finalTotal);
            await connection.query(
                customerQueries.updateCustomerPoints,
                [pointsEarned, pointsEarned, pointsEarned, pointsEarned, customerId]
            );
    
            await connection.commit();
    
            return {
                transactionId,
                total: finalTotal,
                discountAmount,
                pointsEarned
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
      
    // TODO
    static async placeGuestOrder(items, total, customerInfo, discountPercentage, discountAmount) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
    
        // Create transaction
        const [transactionResult] = await connection.query(
        transactionQueries.createTransaction,
        [null, total * (1 - discountPercentage / 100) - discountAmount, 'Credit Card', discountPercentage, discountAmount, customerInfo.name, customerInfo.phoneNumber, customerInfo.address]
        );
    
        const transactionId = transactionResult.insertId;
    
        // Consolidate items by ID and sum quantities
        const consolidatedItems = items.reduce((acc, item) => {
        if (!acc[item.Item_ID]) {
            acc[item.Item_ID] = { ...item };
        } else {
            acc[item.Item_ID].quantity += item.quantity;
        }
        return acc;
        }, {});
    
        // Create transaction items
        for (const itemId in consolidatedItems) {
        const item = consolidatedItems[itemId];
        
        // Check inventory
        const [inventoryResult] = await connection.query(
            'SELECT Quantity FROM Item WHERE Item_ID = ?',
            [item.Item_ID]
        );
    
        if (!inventoryResult.length || inventoryResult[0].Quantity < item.quantity) {
            throw new Error(CUSTOMER_ERRORS.INSUFFICIENT_STOCK);
        }
    
        // Create transaction item
        await connection.query(
            transactionQueries.createTransactionItem,
            [transactionId, item.Item_ID, item.quantity]
        );
    
        // Update inventory
        await connection.query(
            'UPDATE Item SET Quantity = Quantity - ? WHERE Item_ID = ?',
            [item.quantity, item.Item_ID]
        );
        }
    
        await connection.commit();
    
        return {
        transactionId,
        total: total * (1 - discountPercentage / 100) - discountAmount,
        discountApplied: discountAmount,
        pointsEarned: 0
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    }

    static getMembershipDetails(level) {
        const benefits = {
            Bronze: {
                discounts: [],
                pointsRate: 1,
                benefits: ["Earn 1 point per dollar spent"]
            },
            Silver: {
                discounts: ['5% off on orders of 4+ items'],
                pointsRate: 1.2,
                benefits: [
                    "Earn 1.2 points per dollar spent",
                    "5% discount on orders of 4+ items"
                ]
            },
            Gold: {
                discounts: ['5% off on orders of 4+ items', 'Free birthday ice cream'],
                pointsRate: 1.5,
                benefits: [
                    "Earn 1.5 points per dollar spent",
                    "5% discount on orders of 4+ items",
                    "Free ice cream on your birthday"
                ]
            },
            Diamond: {
                discounts: ['5% off on orders of 4+ items', 'Free birthday ice cream', 'Priority ordering'],
                pointsRate: 2,
                benefits: [
                    "Earn 2 points per dollar spent",
                    "5% discount on orders of 4+ items",
                    "Free ice cream on your birthday",
                    "Priority ordering"
                ]
            }
        };

        const nextLevel = this.getNextLevel(level);

        return {
            currentBenefits: benefits[level] || benefits.Bronze,
            nextLevel,
            nextLevelBenefits: nextLevel ? benefits[nextLevel] : null
        };
    }

    static getNextLevel(currentLevel) {
        const levels = ['Bronze', 'Silver', 'Gold', 'Diamond'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }

    static async updateCustomerPoints(connection, customerId, points) {
        await connection.query(
            customerQueries.updateCustomerPoints,
            [points, points, points, points, customerId]
        );
    }
}

module.exports = CustomerService;