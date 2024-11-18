const { pool } = require('../config/db');
const { SHOP_ERRORS } = require('../utils/constants');
const { shopQueries } = require('../models/shopQueries');

class ShopService {
    static async getAllItems() {
        try {
            const [rows] = await pool.query(shopQueries.getAllItemsQuery);
            return rows;
        } catch (error) {
            console.error('Error in getAllItems:', error);
            throw new Error(SHOP_ERRORS.DB_ERROR);
        }
    }

    static async getItemById(id) {
        try {
            const [rows] = await pool.query(shopQueries.getItemByIdQuery, [id]);
            
            if (rows.length === 0) {
                throw new Error(SHOP_ERRORS.ITEM_NOT_FOUND);
            }
            
            return rows[0];
        } catch (error) {
            console.error(`Error in getItemById for ID ${id}:`, error);
            throw error;
        }
    }

    static async createFoodItem(itemData, userRole) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Set user role for trigger
            await connection.query('SET @user_role = ?', [userRole]);

            const [itemResult] = await connection.query(shopQueries.insertItemQuery, [
                itemData.Item_Name,
                itemData.Unit_Price,
                itemData.Quantity || 0
            ]);

            const itemId = itemResult.insertId;

            await connection.query(shopQueries.insertFoodItemQuery, [
                itemId,
                itemData.Calories,
                itemData.Protein,
                itemData.Sugar,
                itemData.Total_Carbs,
                itemData.Total_Fat
            ]);

            await connection.query('SET @user_role = NULL');
            await connection.commit();
            return itemId;

        } catch (error) {
            await connection.rollback();
            console.error('Error in createFoodItem:', error);
            throw new Error(SHOP_ERRORS.CREATE_ERROR);
        } finally {
            connection.release();
        }
    }

    static async updateFoodItem(id, itemData) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(shopQueries.updateItemQuery, [
                itemData.Item_Name,
                itemData.Unit_Price,
                id
            ]);

            await connection.query(shopQueries.updateFoodItemQuery, [
                itemData.Calories,
                itemData.Protein,
                itemData.Sugar,
                itemData.Total_Carbs,
                itemData.Total_Fat,
                id
            ]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();

            if(error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                throw error;
            }

            throw new Error(SHOP_ERRORS.UPDATE_ERROR);
        } finally {
            connection.release();
        }
    }

    static async deleteFoodItem(id) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Delete food_item first due to FK constraints
            await connection.query(shopQueries.deleteFoodItemQuery, [id]);
            await connection.query(shopQueries.deleteInventoryLog, [id]);
            await connection.query(shopQueries.deleteVendorPriceHisQuery, [id]);
            await connection.query(shopQueries.deleteRetailPriceHisQuery, [id]);
            await connection.query(shopQueries.deleteTransactionItem, [id]);
            await connection.query(shopQueries.deleteItemQuery, [id]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();

            if(error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                throw error;
            }

            throw new Error(SHOP_ERRORS.DELETE_ERROR);
        } finally {
            connection.release();
        }
    }

    static async updateQuantity(id, quantity, userRole) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Set user role for trigger and update quantity
            await connection.query('SET @user_role = ?', [userRole]);
            
            const [result] = await connection.query(
                'SELECT Quantity FROM Item WHERE Item_ID = ?',
                [id]
            );

            if (result.length === 0) {
                throw new Error(SHOP_ERRORS.ITEM_NOT_FOUND);
            }

            const previousQuantity = result[0].Quantity;
            
            await connection.query(
                'UPDATE Item SET Quantity = ? WHERE Item_ID = ?',
                [quantity, id]
            );

            // Log the quantity change
            await connection.query(
                `INSERT INTO Inventory_Log 
                (Item_ID, Action_Type, Quantity_Changed, Previous_Quantity, New_Quantity, Action_By)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    'MANUAL_UPDATE',
                    quantity - previousQuantity,
                    previousQuantity,
                    quantity,
                    userRole
                ]
            );

            await connection.query('SET @user_role = NULL');
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Error updating quantity:', error);
            throw error.message === SHOP_ERRORS.ITEM_NOT_FOUND 
                ? error 
                : new Error(SHOP_ERRORS.UPDATE_ERROR);
        } finally {
            connection.release();
        }
    }

    static async getInventoryLogs(startDate, endDate) {
        try {
            const [logs] = await pool.query(
                shopQueries.getInventoryLogsQuery,
                [startDate, endDate]
            );
            return logs;
        } catch (error) {
            console.error('Error in getInventoryLogs:', error);
            throw new Error(SHOP_ERRORS.DB_ERROR);
        }
    }

}

module.exports = ShopService;