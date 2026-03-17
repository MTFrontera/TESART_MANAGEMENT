-- MySQL/TiDB CREATE TABLE statements for CSV import

-- 1. counters table
CREATE TABLE counters (
  table_name VARCHAR(50) PRIMARY KEY,
  last_id INT DEFAULT 0
);

-- 2. customer table
CREATE TABLE customer (
  CustomerID INT PRIMARY KEY,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Email VARCHAR(100),
  PhoneNumber VARCHAR(30),
  Address VARCHAR(150)
);

-- 3. employee table
CREATE TABLE employee (
  EmployeeID INT PRIMARY KEY,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Role VARCHAR(50),
  ContactNumber VARCHAR(20),
  ReportsTo INT
);

-- 4. product table
CREATE TABLE product (
  ProductID INT PRIMARY KEY,
  ProductName VARCHAR(100),
  Category VARCHAR(100),
  UnitPrice DECIMAL(10,2),
  Description TEXT,
  ReturnPolicy TEXT,
  Warranty VARCHAR(50)
);

-- 5. order table (note: 'order' is a reserved word)
CREATE TABLE `order` (
  OrderID INT PRIMARY KEY,
  CustomerID INT,
  EmployeeID INT,
  OrderDate DATETIME,
  OrderStatus VARCHAR(50),
  DeliveryMethod VARCHAR(50),
  TotalAmount DECIMAL(10,2)
);

-- 6. orderdetails table
CREATE TABLE orderdetails (
  OrderDetailID INT PRIMARY KEY,
  OrderID INT,
  ProductID INT,
  Quantity INT,
  UnitPrice DECIMAL(10,2),
  Subtotal DECIMAL(10,2)
);

-- 7. inventory table
CREATE TABLE inventory (
  InventoryID INT PRIMARY KEY,
  ProductID INT,
  StockQuantity INT,
  LastUpdated DATETIME
);

-- 8. payment table
CREATE TABLE payment (
  PaymentID INT PRIMARY KEY,
  OrderID INT,
  PaymentDate DATETIME,
  PaymentMethod VARCHAR(50),
  AmountPaid DECIMAL(10,2),
  PaymentStatus VARCHAR(50)
);

-- 9. delivery_pickup table
CREATE TABLE delivery_pickup (
  DeliveryID INT PRIMARY KEY,
  OrderID INT,
  DriverID INT,
  AssistantID INT,
  DeliveryType VARCHAR(50),
  DeliveryDate DATETIME,
  DeliveryStatus VARCHAR(50)
);

-- Add foreign key constraints after all tables are created
ALTER TABLE employee ADD CONSTRAINT fk_employee_reports_to FOREIGN KEY (ReportsTo) REFERENCES employee(EmployeeID);
ALTER TABLE `order` ADD CONSTRAINT fk_order_customer FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID);
ALTER TABLE `order` ADD CONSTRAINT fk_order_employee FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID);
ALTER TABLE orderdetails ADD CONSTRAINT fk_orderdetails_order FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);
ALTER TABLE orderdetails ADD CONSTRAINT fk_orderdetails_product FOREIGN KEY (ProductID) REFERENCES product(ProductID);
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_product FOREIGN KEY (ProductID) REFERENCES product(ProductID);
ALTER TABLE payment ADD CONSTRAINT fk_payment_order FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);
ALTER TABLE delivery_pickup ADD CONSTRAINT fk_delivery_order FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);
ALTER TABLE delivery_pickup ADD CONSTRAINT fk_delivery_driver FOREIGN KEY (DriverID) REFERENCES employee(EmployeeID);
ALTER TABLE delivery_pickup ADD CONSTRAINT fk_delivery_assistant FOREIGN KEY (AssistantID) REFERENCES employee(EmployeeID);