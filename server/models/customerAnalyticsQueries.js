const customerAnalyticsQueries = {
    getMembershipDistribution: `
        SELECT 
            c.Membership_Level as level,
            COUNT(*) as count,
            SUM(IFNULL((
                SELECT SUM(t.Total_Price)
                FROM Transaction t
                WHERE t.Customer_ID = c.Customer_ID
                AND t.Date BETWEEN ? AND ?
            ), 0)) as revenue
        FROM Customer c
        GROUP BY c.Membership_Level
        ORDER BY count DESC
    `,

    getTopCustomers: `
        SELECT 
            c.Customer_ID as id,
            CONCAT(c.First_Name, ' ', c.Last_Name) as name,
            c.Membership_Level as membershipLevel,
            COUNT(DISTINCT t.Transaction_ID) as totalOrders,
            SUM(t.Total_Price) as totalSpent,
            (c.Total_Accrued_Discount_Points - c.Discount_Points_Used) as pointsBalance
        FROM Customer c
        LEFT JOIN Transaction t ON c.Customer_ID = t.Customer_ID
        WHERE t.Date BETWEEN ? AND ?
        GROUP BY c.Customer_ID, c.First_Name, c.Last_Name, c.Membership_Level, 
                c.Total_Accrued_Discount_Points, c.Discount_Points_Used
        ORDER BY totalSpent DESC
        LIMIT 10
    `,

    getMembershipTransitions: `
        WITH MonthlyStats AS (
            SELECT 
                DATE(t.Date) as date,
                c.Customer_ID,
                c.Membership_Level,
                LAG(c.Membership_Level) OVER (PARTITION BY c.Customer_ID ORDER BY t.Date) as prev_level
            FROM Transaction t
            JOIN Customer c ON t.Customer_ID = c.Customer_ID
            WHERE t.Date BETWEEN ? AND ?
        )
        SELECT 
            date,
            SUM(CASE 
                WHEN Membership_Level > prev_level THEN 1 
                ELSE 0 
            END) as upgrades,
            SUM(CASE 
                WHEN Membership_Level < prev_level THEN 1 
                ELSE 0 
            END) as downgrades
        FROM MonthlyStats
        GROUP BY date
        ORDER BY date
    `,

    getRetentionByLevel: `
        SELECT 
            c.Membership_Level as level,
            COUNT(DISTINCT CASE 
                WHEN EXISTS (
                    SELECT 1 FROM Transaction t2 
                    WHERE t2.Customer_ID = c.Customer_ID 
                    AND t2.Date BETWEEN ? AND DATE_ADD(?, INTERVAL 30 DAY)
                ) THEN c.Customer_ID 
            END) * 100.0 / NULLIF(COUNT(DISTINCT c.Customer_ID), 0) as retentionRate
        FROM Customer c
        LEFT JOIN Transaction t1 ON c.Customer_ID = t1.Customer_ID
            AND t1.Date BETWEEN DATE_SUB(?, INTERVAL 30 DAY) AND ?
        GROUP BY c.Membership_Level
    `,

    getPointsActivity: `
        SELECT 
            DATE(t.Date) as date,
            SUM(FLOOR(t.Total_Price)) as earned,
            SUM(c.Discount_Points_Used) as redeemed
        FROM Transaction t
        JOIN Customer c ON t.Customer_ID = c.Customer_ID
        WHERE t.Date BETWEEN ? AND ?
        GROUP BY DATE(t.Date)
        ORDER BY date
    `,

    getPointsUsageByCategory: `
        SELECT 
            COALESCE(cc.Coupon_Type, 'Standard Purchase') as category,
            SUM(c.Discount_Points_Used) as pointsUsed
        FROM Transaction t
        JOIN Customer c ON t.Customer_ID = c.Customer_ID
        LEFT JOIN Customer_Coupons cc ON t.Transaction_ID = cc.Transaction_ID
        WHERE t.Date BETWEEN ? AND ?
        AND c.Discount_Points_Used > 0
        GROUP BY COALESCE(cc.Coupon_Type, 'Standard Purchase')
    `,

    getOverallMetrics: `
        SELECT 
            COUNT(DISTINCT c.Customer_ID) as totalCustomers,
            COALESCE(AVG(t.Total_Price), 0) as averageOrderValue,
            COUNT(DISTINCT CASE 
                WHEN t.Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
                THEN c.Customer_ID 
            END) as activeMembers,
            SUM(c.Discount_Points_Used) as totalPointsRedeemed
        FROM Customer c
        LEFT JOIN Transaction t ON c.Customer_ID = t.Customer_ID
            AND t.Date BETWEEN ? AND ?
    `
};

module.exports = {
    customerAnalyticsQueries
};