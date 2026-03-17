-- Individual table creation - run one at a time to find which fails

-- 1. Create counters table
CREATE TABLE IF NOT EXISTS counters (
  table_name VARCHAR(50) PRIMARY KEY,
  last_id INT DEFAULT 0
);

-- 2. Create customer table
CREATE TABLE IF NOT EXISTS customer (
  CustomerID INT PRIMARY KEY,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Email VARCHAR(100),
  PhoneNumber VARCHAR(30),
  Address VARCHAR(150)
);

-- 3. Create employee table
CREATE TABLE IF NOT EXISTS employee (
  EmployeeID INT PRIMARY KEY,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Role VARCHAR(50),
  ContactNumber VARCHAR(20),
  ReportsTo INT
);

-- 4. Create product table
CREATE TABLE IF NOT EXISTS product (
  ProductID INT PRIMARY KEY,
  ProductName VARCHAR(100),
  Category VARCHAR(100),
  UnitPrice DECIMAL(10,2),
  Description TEXT,
  ReturnPolicy TEXT,
  Warranty VARCHAR(50)
);

-- 5. Create order table
CREATE TABLE IF NOT EXISTS `order` (
  OrderID INT PRIMARY KEY,
  CustomerID INT,
  EmployeeID INT,
  OrderDate DATETIME,
  OrderStatus VARCHAR(50),
  DeliveryMethod VARCHAR(50),
  TotalAmount DECIMAL(10,2)
);

-- 6. Create orderdetails table
CREATE TABLE IF NOT EXISTS orderdetails (
  OrderDetailID INT PRIMARY KEY,
  OrderID INT,
  ProductID INT,
  Quantity INT,
  UnitPrice DECIMAL(10,2),
  Subtotal DECIMAL(10,2)
);

-- 7. Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  InventoryID INT PRIMARY KEY,
  ProductID INT,
  StockQuantity INT,
  LastUpdated DATETIME
);

-- 8. Create payment table
CREATE TABLE IF NOT EXISTS payment (
  PaymentID INT PRIMARY KEY,
  OrderID INT,
  PaymentDate DATETIME,
  PaymentMethod VARCHAR(50),
  AmountPaid DECIMAL(10,2),
  PaymentStatus VARCHAR(50)
);

-- 9. Create delivery_pickup table
CREATE TABLE IF NOT EXISTS delivery_pickup (
  DeliveryID INT PRIMARY KEY,
  OrderID INT,
  DriverID INT,
  AssistantID INT,
  DeliveryType VARCHAR(50),
  DeliveryDate DATETIME,
  DeliveryStatus VARCHAR(50)
);