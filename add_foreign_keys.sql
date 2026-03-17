-- Foreign key constraints - run after all tables are created

-- Employee table foreign key
ALTER TABLE employee
ADD CONSTRAINT fk_employee_reports_to
FOREIGN KEY (ReportsTo) REFERENCES employee(EmployeeID);

-- Order table foreign keys
ALTER TABLE `order`
ADD CONSTRAINT fk_order_customer
FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID);

ALTER TABLE `order`
ADD CONSTRAINT fk_order_employee
FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID);

-- OrderDetails table foreign keys
ALTER TABLE orderdetails
ADD CONSTRAINT fk_orderdetails_order
FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);

ALTER TABLE orderdetails
ADD CONSTRAINT fk_orderdetails_product
FOREIGN KEY (ProductID) REFERENCES product(ProductID);

-- Inventory table foreign key
ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_product
FOREIGN KEY (ProductID) REFERENCES product(ProductID);

-- Payment table foreign key
ALTER TABLE payment
ADD CONSTRAINT fk_payment_order
FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);

-- Delivery_Pickup table foreign keys
ALTER TABLE delivery_pickup
ADD CONSTRAINT fk_delivery_order
FOREIGN KEY (OrderID) REFERENCES `order`(OrderID);

ALTER TABLE delivery_pickup
ADD CONSTRAINT fk_delivery_driver
FOREIGN KEY (DriverID) REFERENCES employee(EmployeeID);

ALTER TABLE delivery_pickup
ADD CONSTRAINT fk_delivery_assistant
FOREIGN KEY (AssistantID) REFERENCES employee(EmployeeID);