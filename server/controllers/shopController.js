const ShopService = require('../services/shopService');
const { SHOP_ERRORS } = require('../utils/constants');

class ShopController {
    static async getAllFlavors(req, res) {
        try {
            const items = await ShopService.getAllItems();
            res.json(items);
        } catch (error) {
            console.error('Controller - getAllFlavors error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getFlavorById(req, res) {
        try {
            const item = await ShopService.getItemById(req.params.id);
            res.json(item);
        } catch (error) {
            if (error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async createFlavor(req, res) {
        try {
            const itemId = await ShopService.createFoodItem(req.body);
            
            res.status(201).json({
                message: 'Food item added successfully',
                itemId: itemId
            });
        } catch (error) {
            if (error.message.includes('Missing required fields')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async updateFlavor(req, res) {
        try {
            await ShopService.updateFoodItem(req.params.id, req.body);
            
            res.status(201).json({
                message: 'Food item update successfully'
            });
        } catch (error) {
            if (error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async deleteFlavor(req, res) {
        try {
            await ShopService.deleteFoodItem(req.params.id, req.body);
            
            res.status(201).json({
                message: 'Food item delete successfully'
            });
        } catch (error) {
            if (error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async updateQuantity(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            
            await ShopService.updateQuantity(id, quantity, req.user.role);
            
            res.json({ 
                message: 'Quantity updated successfully',
                quantity: quantity
            });
        } catch (error) {
            console.error('Controller - updateQuantity error:', error);
            if (error.message === SHOP_ERRORS.ITEM_NOT_FOUND) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async getInventoryLogs(req, res) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
            const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
            
            const logs = await ShopService.getInventoryLogs(startDate, endDate);
            res.json(logs);
        } catch (error) {
            console.error('Controller - getInventoryLogs error:', error);
            res.status(500).json({ error: 'Error fetching inventory logs' });
        }
    }

}

module.exports = ShopController;
