-- Check what tables exist
SHOW TABLES;

-- Check table structure for each table
DESCRIBE customer;
DESCRIBE employee;
DESCRIBE product;
DESCRIBE `order`;
DESCRIBE orderdetails;
DESCRIBE inventory;
DESCRIBE payment;
DESCRIBE delivery_pickup;
DESCRIBE counters;

-- Check data in each table
SELECT COUNT(*) as customer_count FROM customer;
SELECT COUNT(*) as employee_count FROM employee;
SELECT COUNT(*) as product_count FROM product;
SELECT COUNT(*) as order_count FROM `order`;
SELECT COUNT(*) as orderdetails_count FROM orderdetails;
SELECT COUNT(*) as inventory_count FROM inventory;
SELECT COUNT(*) as payment_count FROM payment;
SELECT COUNT(*) as delivery_count FROM delivery_pickup;
SELECT COUNT(*) as counters_count FROM counters;