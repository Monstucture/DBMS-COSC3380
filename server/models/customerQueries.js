const customerQueries = {
    getCustomerById: `
      SELECT 
          c.Customer_ID, 
          c.Membership_Level, 
          c.Phone_Number, 
          c.Account_Creation_Date, 
          c.Total_Accrued_Discount_Points, 
          c.Discount_Points_Used,
          c.First_Name,
          c.Last_Name,
          c.Address,
          c.Birth_Date,
          (c.Total_Accrued_Discount_Points - c.Discount_Points_Used) as Available_Points,
          CASE
              WHEN c.Membership_Level = 'Bronze' THEN 50 - (c.Total_Accrued_Discount_Points - c.Discount_Points_Used)
              WHEN c.Membership_Level = 'Silver' THEN 100 - (c.Total_Accrued_Discount_Points - c.Discount_Points_Used)
              WHEN c.Membership_Level = 'Gold' THEN 200 - (c.Total_Accrued_Discount_Points - c.Discount_Points_Used)
              ELSE 0
          END as Points_To_Next_Level
      FROM Customer c
      WHERE c.Customer_ID = ?
    `,
    
    getCustomerByPhone: `
        SELECT * FROM Customer 
        WHERE Phone_Number = ?
    `,
  
    getCustomerOrders: `
      SELECT
        t.Transaction_ID,
        DATE_FORMAT(t.Date, '%Y-%m-%d %H:%i:%s') as Transaction_Date,
        t.Total_Price as Total_Amount,
        t.Discount_Percentage,
        t.Discount_Amount,
        CONCAT('[',
          GROUP_CONCAT(JSON_OBJECT(
            'Item_ID', ti.Item_ID,
            'Item_Name', i.Item_Name,
            'Unit_Price', i.Unit_Price,
            'Quantity_Sold', ti.Quantity_Sold
          )),
        ']') AS items
      FROM Transaction t
      JOIN Transaction_Item ti ON t.Transaction_ID = ti.Transaction_ID
      JOIN Item i ON ti.Item_ID = i.Item_ID
      WHERE t.Customer_ID = ?
      GROUP BY t.Transaction_ID
      ORDER BY t.Date DESC
    `,

    getAvailableCoupons: `
        SELECT 
            cc.Coupon_ID,
            cc.Customer_ID,
            cc.Coupon_Type,
            cc.Description,
            cc.Created_Date,
            cc.Expiry_Date,
            cc.Is_Used,
            cc.Promotion_ID,
            p.Discount_Percentage,
            p.Discount_Amount
        FROM Customer_Coupons cc
        LEFT JOIN Promotions p ON cc.Promotion_ID = p.Promotion_ID
        WHERE cc.Customer_ID = ?
        AND cc.Is_Used = FALSE
        AND cc.Expiry_Date >= CURDATE()
        ORDER BY cc.Expiry_Date ASC
    `,

    getCouponById: `
        SELECT 
            cc.*,
            p.Discount_Percentage,
            p.Discount_Amount
        FROM Customer_Coupons cc
        LEFT JOIN promotions p ON cc.Promotion_ID = p.Promotion_ID
        WHERE cc.Coupon_ID = ?
        AND cc.Customer_ID = ?
        AND cc.Is_Used = FALSE
        AND cc.Expiry_Date >= CURDATE()
    `,

    useCoupon: `
        UPDATE Customer_Coupons
        SET 
            Is_Used = TRUE,
            Used_Date = CURDATE(),
            Transaction_ID = ?
        WHERE Coupon_ID = ?
        AND Customer_ID = ?
        AND Is_Used = FALSE
        AND Expiry_Date >= CURDATE()
    `,
  
    updateCustomerPoints: `
      UPDATE Customer
      SET 
        Total_Accrued_Discount_Points = Total_Accrued_Discount_Points + ?,
        Membership_Level = CASE
          WHEN (Total_Accrued_Discount_Points + ? - Discount_Points_Used) >= 200 THEN 'Diamond'
          WHEN (Total_Accrued_Discount_Points + ? - Discount_Points_Used) >= 100 THEN 'Gold'
          WHEN (Total_Accrued_Discount_Points + ? - Discount_Points_Used) >= 50 THEN 'Silver'
          ELSE 'Bronze'
        END
      WHERE Customer_ID = ?
    `,
  
    createCustomer: `
      INSERT INTO Customer (
          Phone_Number,
          Address,
          First_Name,
          Last_Name,
          Birth_Date,
          Membership_Level,
          Account_Creation_Date,
          Total_Accrued_Discount_Points,
          Discount_Points_Used,
          Current_Discount_Points,
          Member_Length
      ) VALUES (?, ?, ?, ?, ?, 'Bronze', CURDATE(), 0, 0, 0, 0)
    `,
  
    updateCustomerAddress: `
      UPDATE Customer 
      SET Address = ?
      WHERE Customer_ID = ?
    `
  };
  
  module.exports = {
    customerQueries
  };