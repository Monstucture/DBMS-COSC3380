const reportQueries = {
    getSalesData: `
        SELECT 
            DATE(t.Date) as date,
            SUM(t.Total_Price) as revenue,
            COUNT(DISTINCT t.Transaction_ID) as orders,
            SUM(t.Total_Price - t.Discount_Amount) as profit
        FROM Transaction t
        WHERE t.Date BETWEEN ? AND ?
        GROUP BY DATE(t.Date)
        ORDER BY date
    `,

    getTopSellingItems: `
        SELECT 
            i.Item_ID as itemId,
            i.Item_Name as name,
            SUM(ti.Quantity_Sold) as quantitySold,
            SUM(ti.Quantity_Sold * i.Unit_Price) as revenue,
            SUM((ti.Quantity_Sold * i.Unit_Price) - 
                COALESCE(t.Discount_Amount * (ti.Quantity_Sold * i.Unit_Price / t.Total_Price), 0)
            ) as profit
        FROM Transaction t
        JOIN Transaction_Item ti ON t.Transaction_ID = ti.Transaction_ID
        JOIN Item i ON ti.Item_ID = i.Item_ID
        WHERE t.Date BETWEEN ? AND ?
        GROUP BY i.Item_ID, i.Item_Name
        ORDER BY quantitySold DESC
        LIMIT 10
    `,

    getSalesDetailsData: `
        SELECT 
            t.Transaction_ID,
            t.Date,
            t.Total_Price,
            t.Payment_Type,
            t.Discount_Percentage,
            t.Discount_Amount,
            c.First_Name,
            c.Last_Name,
            c.Membership_Level,
            GROUP_CONCAT(
                JSON_OBJECT(
                    'Item_Name', i.Item_Name,
                    'Quantity_Sold', ti.Quantity_Sold,
                    'Unit_Price', i.Unit_Price
                )
            ) as items
        FROM Transaction t
        JOIN Customer c ON t.Customer_ID = c.Customer_ID
        JOIN Transaction_Item ti ON t.Transaction_ID = ti.Transaction_ID
        JOIN Item i ON ti.Item_ID = i.Item_ID
        WHERE t.Date BETWEEN ? AND ?
        GROUP BY t.Transaction_ID, t.Date, t.Total_Price, t.Payment_Type, 
                t.Discount_Percentage, t.Discount_Amount,
                c.First_Name, c.Last_Name, c.Membership_Level
        ORDER BY t.Date DESC
    `,

    getInventoryReport: `
        SELECT 
            i.Item_ID,
            i.Item_Name,
            i.Quantity,
            COUNT(il.Log_ID) as changes_count,
            SUM(CASE WHEN il.Quantity_Changed > 0 THEN il.Quantity_Changed ELSE 0 END) as total_added,
            SUM(CASE WHEN il.Quantity_Changed < 0 THEN ABS(il.Quantity_Changed) ELSE 0 END) as total_removed,
            MIN(i.Quantity) as min_quantity,
            MAX(i.Quantity) as max_quantity
        FROM Item i
        LEFT JOIN Inventory_Log il ON i.Item_ID = il.Item_ID
        AND il.Action_Date BETWEEN ? AND ?
        GROUP BY i.Item_ID, i.Item_Name, i.Quantity
        ORDER BY i.Item_Name
    `
};

module.exports = {
    reportQueries
};