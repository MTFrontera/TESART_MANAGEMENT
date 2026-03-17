# TesArt Management System - CSV Data Files

This folder contains CSV files with sample data for the TesArt Management System database tables. These files were converted from the MySQL/TiDB schema.sql file.

## Files Created:

1. **counters.csv** - ID counter tracking for auto-increment functionality
2. **customer.csv** - Customer information (5 sample customers)
3. **employee.csv** - Employee records (7 employees including CEO, Manager, etc.)
4. **product.csv** - Product catalog (16 products across different categories)
5. **order.csv** - Order records (5 sample orders)
6. **orderdetails.csv** - Order line items (6 detail records)
7. **inventory.csv** - Stock levels for products (6 inventory records)
8. **payment.csv** - Payment records (3 payment transactions)
9. **delivery_pickup.csv** - Delivery/pickup records (2 delivery records)

## Usage:

These CSV files can be imported into:
- TiDB Cloud database
- MySQL databases
- Other database systems that support CSV import
- Spreadsheet applications for data analysis

## Import Instructions for TiDB/MySQL:

```sql
LOAD DATA LOCAL INFILE '/path/to/customer.csv'
INTO TABLE customer
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

## Data Relationships:

- Customers place Orders
- Orders have OrderDetails (line items)
- Products are referenced in OrderDetails and Inventory
- Employees process Orders and handle Deliveries
- Payments are linked to Orders
- Inventory tracks stock levels for Products