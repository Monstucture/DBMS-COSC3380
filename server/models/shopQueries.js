const shopQueries = {
    getAllItemsQuery: `
        SELECT i.*, f.*, 
            CASE 
                WHEN i.Quantity < 5 THEN TRUE 
                ELSE FALSE 
            END as LowStock
        FROM Item i
        LEFT JOIN Food_Item f ON i.Item_ID = f.Item_ID
        ORDER BY i.Item_Name
    `,
    
    getItemByIdQuery: `
        SELECT i.*, f.*
        FROM Item i
        LEFT JOIN Food_Item f ON i.Item_ID = f.Item_ID
        WHERE i.Item_ID = ?
    `,
    
    insertItemQuery: `
        INSERT INTO Item (Item_Name, Unit_Price, Quantity) 
        VALUES (?, ?, ?)
    `,
    
    insertFoodItemQuery: `
        INSERT INTO Food_Item (Item_ID, Calories, Protein, Sugar, Total_Carbs, Total_Fat) 
        VALUES (?, ?, ?, ?, ?, ?)
    `,

    updateItemQuery: `
        UPDATE Item 
        SET Item_Name = ?, Unit_Price = ?
        WHERE Item_ID = ?
    `,

    updateFoodItemQuery: `
        UPDATE Food_Item 
        SET Calories = ?, Protein = ?, Sugar = ?, Total_Carbs = ?, Total_Fat = ?
        WHERE Item_ID = ?
    `,

    deleteItemQuery: `
        DELETE FROM Item
        WHERE Item_ID = ?
    `,

    deleteFoodItemQuery: `
        DELETE FROM Food_Item
        WHERE Item_ID = ?
    `,

    deleteInventoryLog: `
        DELETE FROM Inventory_Log 
        WHERE Item_ID = ?
    `,

    deleteVendorPriceHisQuery: `
        DELETE FROM Vendor_Price_History 
        WHERE Item_ID = ?
    `,

    deleteRetailPriceHisQuery: `
        DELETE FROM Retail_Price_History WHERE Item_ID = ?
    `,

    deleteTransactionItem: `
        DELETE FROM Transaction_Item WHERE Item_ID = ?
    `,

    getInventoryLogsQuery: `
        SELECT 
            l.Log_ID,
            l.Action_Date,
            l.Action_Type,
            l.Quantity_Changed,
            l.New_Quantity,
            l.Action_By,
            i.Item_Name
        FROM Inventory_Log l
        JOIN Item i ON l.Item_ID = i.Item_ID
        WHERE l.Action_Date BETWEEN ? AND ?
        ORDER BY l.Action_Date DESC
    `
};

module.exports = {
    shopQueries
};