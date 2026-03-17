-- Test queries to verify data insertion
-- Run these in TiDB Cloud SQL Editor to confirm data was inserted correctly

-- Check table counts
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customer
UNION ALL
SELECT 'employees', COUNT(*) FROM employee
UNION ALL
SELECT 'products', COUNT(*) FROM product
UNION ALL
SELECT 'orders', COUNT(*) FROM `order`
UNION ALL
SELECT 'orderdetails', COUNT(*) FROM orderdetails
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'payments', COUNT(*) FROM payment
UNION ALL
SELECT 'delivery_pickup', COUNT(*) FROM delivery_pickup;

-- Sample data verification
SELECT 'First 3 customers:' as info;
SELECT CustomerID, FirstName, LastName, Email FROM customer LIMIT 3;

SELECT 'First 3 products:' as info;
SELECT ProductID, ProductName, UnitPrice FROM product LIMIT 3;

SELECT 'First 2 orders:' as info;
SELECT OrderID, CustomerID, TotalAmount, OrderStatus FROM `order` LIMIT 2;