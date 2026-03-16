-- PostgreSQL schema for TesArt Management System

CREATE TABLE customer (
    CustomerID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    PhoneNumber VARCHAR(20),
    Address TEXT,
    CustomerName VARCHAR(101) GENERATED ALWAYS AS (FirstName || ' ' || LastName) STORED
);

CREATE TABLE employee (
    EmployeeID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Role VARCHAR(50),
    ContactNumber VARCHAR(20),
    ReportsTo INTEGER REFERENCES employee(EmployeeID)
);

CREATE TABLE product (
    ProductID SERIAL PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Description TEXT,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Category VARCHAR(50)
);

CREATE TABLE "order" (
    OrderID SERIAL PRIMARY KEY,
    CustomerID INTEGER REFERENCES customer(CustomerID),
    EmployeeID INTEGER REFERENCES employee(EmployeeID),
    OrderDate DATE NOT NULL DEFAULT CURRENT_DATE,
    OrderStatus VARCHAR(20) DEFAULT 'Pending',
    DeliveryMethod VARCHAR(20),
    TotalAmount DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE orderdetails (
    OrderDetailID SERIAL PRIMARY KEY,
    OrderID INTEGER REFERENCES "order"(OrderID),
    ProductID INTEGER REFERENCES product(ProductID),
    Quantity INTEGER NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) GENERATED ALWAYS AS (Quantity * UnitPrice) STORED
);

CREATE TABLE inventory (
    InventoryID SERIAL PRIMARY KEY,
    ProductID INTEGER REFERENCES product(ProductID),
    StockQuantity INTEGER DEFAULT 0,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment (
    PaymentID SERIAL PRIMARY KEY,
    OrderID INTEGER REFERENCES "order"(OrderID),
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PaymentMethod VARCHAR(50),
    AmountPaid DECIMAL(10,2),
    PaymentStatus VARCHAR(20)
);

CREATE TABLE delivery_pickup (
    DeliveryID SERIAL PRIMARY KEY,
    OrderID INTEGER REFERENCES "order"(OrderID),
    DeliveryType VARCHAR(20),
    DeliveryDate DATE,
    DeliveryStatus VARCHAR(20)
);