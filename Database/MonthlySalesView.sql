 View: MonthlyItemSales
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `MonthlyItemSales` AS select `i`.`Item_Name` AS `item_name`,year(`t`.`Date`) AS `year`,month(`t`.`Date`) AS `month`,sum(`ti`.`Quantity_Sold`) AS `total_volume`,sum((`ti`.`Quantity_Sold` * `rph`.`Retail_Price`)) AS `total_revenue` from (((`Transaction_Item` `ti` join `Item` `i` on((`ti`.`Item_ID` = `i`.`Item_ID`))) join `Transaction` `t` on((`ti`.`Transaction_ID` = `t`.`Transaction_ID`))) join `Retail_Price_History` `rph` on(((`rph`.`Item_ID` = `ti`.`Item_ID`) and (`t`.`Date` between `rph`.`Start_Date` and ifnull(`rph`.`End_Date`,curdate()))))) group by `i`.`Item_Name`,`year`,`month` order by `i`.`Item_Name`,`year`,`month`
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)