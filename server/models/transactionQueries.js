const transactionQueries = {

    createTransaction: `
        INSERT INTO transaction (
            Customer_ID,
            Total_Price,
            Date,
            Payment_Type,
            Promotion_ID,
            Discount_Percentage,
            Discount_Amount
        ) VALUES (?, ?, NOW(), ?, ?, ?, ?)
    `,

    createTransactionItem: `
        INSERT INTO transaction_item (
            Transaction_ID,
            Item_ID,
            Quantity_Sold
        ) VALUES (?, ?, ?)
    `,

    getTransactionItems: `
        SELECT 
            ti.*,
            i.Item_Name,
            i.Unit_Price
        FROM transaction_item ti
        JOIN item i ON ti.Item_ID = i.Item_ID
        WHERE ti.Transaction_ID = ?
    `,

    updateTransactionItem: `
        UPDATE transaction_item 
        SET Quantity_Sold = ?
        WHERE Transaction_ID = ? AND Item_ID = ?
    `,

    deleteTransactionItem: `
        DELETE FROM transaction_item 
        WHERE Transaction_ID = ? AND Item_ID = ?
    `,

    // Implement this fix later
    getInventoryLogs: `
        SELECT 
            il.Log_ID,
            i.Item_Name,
            il.Action_Type,
            il.Quantity_Changed,
            il.Previous_Quantity,
            il.New_Quantity,
            il.Action_By,
            il.Action_Date
        FROM inventory_log il
        JOIN item i ON il.Item_ID = i.Item_ID
        WHERE il.Action_Date BETWEEN ? AND ?
        ORDER BY il.Action_Date DESC
    `,

    getTransactionInventoryLogs: `
        SELECT 
            il.Log_ID,
            i.Item_Name,
            il.Action_Type,
            il.Quantity_Changed,
            il.Previous_Quantity,
            il.New_Quantity,
            il.Action_By,
            il.Action_Date
        FROM inventory_log il
        JOIN item i ON il.Item_ID = i.Item_ID
        JOIN transaction_item ti ON i.Item_ID = ti.Item_ID
        WHERE ti.Transaction_ID = ?
        ORDER BY il.Action_Date DESC
    `,

    getItemInventoryLogs: `
        SELECT 
            il.Log_ID,
            i.Item_Name,
            il.Action_Type,
            il.Quantity_Changed,
            il.Previous_Quantity,
            il.New_Quantity,
            il.Action_By,
            il.Action_Date
        FROM inventory_log il
        JOIN item i ON il.Item_ID = i.Item_ID
        WHERE i.Item_ID = ?
        ORDER BY il.Action_Date DESC
    `,

    getInventorySummary: `
        SELECT 
            i.Item_ID,
            i.Item_Name,
            i.Quantity as Current_Stock,
            COUNT(il.Log_ID) as Total_Changes,
            ABS(SUM(CASE 
                WHEN il.Action_Type = 'MANUAL_UPDATE' AND il.Quantity_Changed < 0 
                THEN il.Quantity_Changed 
                ELSE 0 
            END)) as Total_Sold,
            SUM(CASE 
                WHEN il.Action_Type IN ('REORDER', 'MANUAL_UPDATE') AND il.Quantity_Changed > 0 
                THEN il.Quantity_Changed 
                ELSE 0 
            END) as Total_Restocked
        FROM item i
        LEFT JOIN inventory_log il ON i.Item_ID = il.Item_ID
        GROUP BY i.Item_ID, i.Item_Name, i.Quantity
        ORDER BY i.Item_Name
    `
};

module.exports = {
    transactionQueries
};