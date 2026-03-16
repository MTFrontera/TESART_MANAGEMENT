-- PostgreSQL schema for TesArt Management System (converted from MariaDB dump)

-- ----- Customers -----
CREATE TABLE customer (
  CustomerID SERIAL PRIMARY KEY,
  CustomerName VARCHAR(100) NOT NULL,
  ContactNumber VARCHAR(30),
  Address VARCHAR(150)
);

INSERT INTO customer (CustomerID, CustomerName, ContactNumber, Address) VALUES
  (1,'Mark Cruz','09123456789','Bukidnon'),
  (2,'Anna Reyes','09122223333','Cagayan de Oro City'),
  (3,'John Santos','09133334444','Malaybalay'),
  (4,'Maria Lopez','09144445555','Valencia'),
  (5,'Jake Tan','09155556666','Davao');

SELECT setval(pg_get_serial_sequence('customer','customerid'), COALESCE((SELECT MAX(customerid) FROM customer), 1));

-- ----- Employees -----
CREATE TABLE employee (
  EmployeeID SERIAL PRIMARY KEY,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Role VARCHAR(50),
  ContactNumber VARCHAR(20),
  ReportsTo INTEGER REFERENCES employee(EmployeeID)
);

INSERT INTO employee (EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo) VALUES
  (1,'Arthuro','Galendez','CEO',NULL,NULL),
  (2,'John','Galendez','Manager',NULL,NULL),
  (3,'Lisa','Garcia','Cashier',NULL,NULL),
  (4,'Pedro','Torres','Printer Operator',NULL,NULL),
  (5,'Ryan','Santos','Delivery Driver','09199998888',NULL),
  (6,'Kevin','Lee','Assistant',NULL,NULL),
  (7,'Maria','Reyes','Senior Designer',NULL,NULL);

SELECT setval(pg_get_serial_sequence('employee','employeeid'), COALESCE((SELECT MAX(employeeid) FROM employee), 1));

-- ----- Products -----
CREATE TABLE product (
  ProductID SERIAL PRIMARY KEY,
  ProductName VARCHAR(100),
  Category VARCHAR(100),
  UnitPrice DECIMAL(10,2),
  Description TEXT,
  ReturnPolicy TEXT,
  Warranty VARCHAR(50)
);

INSERT INTO product (ProductID, ProductName, Category, UnitPrice, Description, ReturnPolicy, Warranty) VALUES
  (1,'Tarpaulin 2x3 ft','Tarpaulin Printing',150.00,'2x3 feet tarpaulin','7 days return','1 month'),
  (2,'Tarpaulin 3x4 ft','Tarpaulin Printing',320.00,'3x4 feet tarpaulin','7 days return','1 month'),
  (3,'Tarpaulin 4x5 ft','Tarpaulin Printing',350.00,'4x5 feet tarpaulin','7 days return','1 month'),
  (4,'Tarpaulin 4x8 ft','Tarpaulin Printing',800.00,'4x8 feet tarpaulin','7 days return','1 month'),
  (5,'Custom Mug Printing','Mug Printing',130.00,'Standard mug printing','No return','No warranty'),
  (6,'Student Mug Printing','Mug Printing',150.00,'Student mug orders','No return','No warranty'),
  (7,'Desk Calendar','Calendar Printing',120.00,'Desk calendar print','Exchange only','No warranty'),
  (8,'Wall Calendar','Calendar Printing',200.00,'Wall calendar print','Exchange only','No warranty'),
  (9,'Bulk Document Printing','Printing Services',60.00,'Bulk printing per page','No return','No warranty'),
  (10,'Bond Paper A4 500 Sheets','Office Supplies',280.00,'A4 bond paper','7 days return','No warranty'),
  (11,'Bond Paper Short 500 Sheets','Office Supplies',260.00,'Short bond paper','7 days return','No warranty'),
  (12,'Glossy Photo Paper 20 Sheets','Office Supplies',180.00,'Glossy photo paper','No return','No warranty'),
  (13,'Ink Cartridge Black','Office Supplies',750.00,'Printer cartridge','No return','6 months'),
  (14,'Laminating Pouch A4 Pack','Office Supplies',120.00,'Laminating pouches','No return','No warranty'),
  (15,'Ballpen Blue','Office Supplies',12.00,'Blue pen','No return','No warranty'),
  (16,'Notebook 80 Pages','Office Supplies',35.00,'Student notebook','No return','No warranty');

SELECT setval(pg_get_serial_sequence('product','productid'), COALESCE((SELECT MAX(productid) FROM product), 1));

-- ----- Orders -----
CREATE TABLE "order" (
  OrderID SERIAL PRIMARY KEY,
  CustomerID INTEGER REFERENCES customer(CustomerID),
  EmployeeID INTEGER REFERENCES employee(EmployeeID),
  OrderDate TIMESTAMP,
  OrderStatus VARCHAR(50),
  DeliveryMethod VARCHAR(50),
  TotalAmount DECIMAL(10,2)
);

INSERT INTO "order" (OrderID, CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount) VALUES
  (1,1,3,'2026-03-01 00:00:00','Completed','Pickup',300.00),
  (2,2,3,'2026-03-02 00:00:00','Completed','Delivery',500.00),
  (3,3,3,'2026-03-03 00:00:00','Pending','Pickup',150.00),
  (4,4,3,'2026-03-04 00:00:00','Completed','Delivery',800.00),
  (5,5,3,'2026-03-05 00:00:00','Pending','Pickup',120.00);

SELECT setval(pg_get_serial_sequence('"order"','orderid'), COALESCE((SELECT MAX(orderid) FROM "order"), 1));

-- ----- Order Details -----
CREATE TABLE orderdetails (
  OrderDetailID SERIAL PRIMARY KEY,
  OrderID INTEGER REFERENCES "order"(OrderID),
  ProductID INTEGER REFERENCES product(ProductID),
  Quantity INTEGER,
  UnitPrice DECIMAL(10,2),
  Subtotal DECIMAL(10,2)
);

INSERT INTO orderdetails (OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal) VALUES
  (1,1,1,2,150.00,300.00),
  (2,2,2,1,320.00,320.00),
  (3,2,5,1,180.00,180.00),
  (4,3,3,1,350.00,350.00),
  (5,4,4,1,800.00,800.00),
  (6,5,7,2,120.00,240.00);

SELECT setval(pg_get_serial_sequence('orderdetails','orderdetailid'), COALESCE((SELECT MAX(orderdetailid) FROM orderdetails), 1));

-- ----- Inventory -----
CREATE TABLE inventory (
  InventoryID SERIAL PRIMARY KEY,
  ProductID INTEGER REFERENCES product(ProductID),
  StockQuantity INTEGER,
  LastUpdated TIMESTAMP
);

INSERT INTO inventory (InventoryID, ProductID, StockQuantity, LastUpdated) VALUES
  (0,3,10,'2026-03-15 23:22:48'),
  (1,1,50,'2026-03-15 23:19:03'),
  (2,2,40,'2026-03-15 23:19:03'),
  (3,3,30,'2026-03-15 23:19:03'),
  (4,4,20,'2026-03-15 23:19:03'),
  (5,5,15,'2026-03-15 23:19:03');

SELECT setval(pg_get_serial_sequence('inventory','inventoryid'), COALESCE((SELECT MAX(inventoryid) FROM inventory), 1));

-- ----- Payments -----
CREATE TABLE payment (
  PaymentID SERIAL PRIMARY KEY,
  OrderID INTEGER REFERENCES "order"(OrderID),
  PaymentDate TIMESTAMP,
  PaymentMethod VARCHAR(50),
  AmountPaid DECIMAL(10,2),
  PaymentStatus VARCHAR(50)
);

INSERT INTO payment (PaymentID, OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus) VALUES
  (1,1,'2026-03-01 00:00:00','Cash',300.00,'Paid'),
  (2,2,'2026-03-02 00:00:00','GCash',500.00,'Paid'),
  (3,3,'2026-03-03 00:00:00','Cash',150.00,'Pending');

SELECT setval(pg_get_serial_sequence('payment','paymentid'), COALESCE((SELECT MAX(paymentid) FROM payment), 1));

-- ----- Delivery/Pickup -----
CREATE TABLE delivery_pickup (
  DeliveryID SERIAL PRIMARY KEY,
  OrderID INTEGER REFERENCES "order"(OrderID),
  DriverID INTEGER REFERENCES employee(EmployeeID),
  AssistantID INTEGER REFERENCES employee(EmployeeID),
  DeliveryType VARCHAR(50),
  DeliveryDate TIMESTAMP,
  DeliveryStatus VARCHAR(50)
);

INSERT INTO delivery_pickup (DeliveryID, OrderID, DriverID, AssistantID, DeliveryType, DeliveryDate, DeliveryStatus) VALUES
  (1,2,5,6,'Delivery','2026-03-02 00:00:00','Delivered'),
  (2,4,5,6,'Delivery','2026-03-04 00:00:00','Delivered');

SELECT setval(pg_get_serial_sequence('delivery_pickup','deliveryid'), COALESCE((SELECT MAX(deliveryid) FROM delivery_pickup), 1));

-- ----- Views -----
CREATE OR REPLACE VIEW ordersummary AS
SELECT
  c.CustomerName AS CustomerName,
  o.OrderID AS OrderID,
  o.TotalAmount AS TotalAmount
FROM customer c
JOIN "order" o ON c.CustomerID = o.CustomerID;

CREATE OR REPLACE VIEW productinventoryview AS
SELECT
  p.ProductName AS ProductName,
  i.StockQuantity AS StockQuantity
FROM product p
JOIN inventory i ON p.ProductID = i.ProductID;
