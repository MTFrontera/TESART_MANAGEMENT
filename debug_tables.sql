-- Check what tables exist in your database
SHOW TABLES;

-- Check if specific tables exist
SELECT 'counters' as table_name, COUNT(*) as exists_check FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'counters'
UNION ALL
SELECT 'customer', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'customer'
UNION ALL
SELECT 'employee', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'employee'
UNION ALL
SELECT 'product', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'product'
UNION ALL
SELECT 'order', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'order'
UNION ALL
SELECT 'orderdetails', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'orderdetails'
UNION ALL
SELECT 'inventory', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'inventory'
UNION ALL
SELECT 'payment', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'payment'
UNION ALL
SELECT 'delivery_pickup', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'delivery_pickup';