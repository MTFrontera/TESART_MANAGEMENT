const path = require('path');

const express = require('express');

const { Pool } = require('pg');

const cors = require('cors');

const bodyParser = require('body-parser');



const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.static('public'));



// Database Connection

const db = new Pool({

    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tesart'

});



// ==========================================

// ORDER DETAILS ROUTES (Sales)

// ==========================================



app.get('/api/orderdetails', (req, res) => {

    const query = `

        SELECT

            od.OrderDetailID,

            od.OrderID,

            TO_CHAR(o.OrderDate, 'Mon DD, YYYY') as Date,

            p.ProductName,

            od.Quantity,

            od.UnitPrice,

            od.Subtotal

        FROM orderdetails od

        JOIN "order" o ON od.OrderID = o.OrderID

        JOIN product p ON od.ProductID = p.ProductID

        ORDER BY od.OrderDetailID DESC

    `;

    db.query(query, (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



app.get('/api/dropdowns', (req, res) => {

    db.query('SELECT OrderID FROM "order"', (err, orders) => {

        if (err) throw err;

        db.query('SELECT ProductID, ProductName, UnitPrice FROM product', (err, products) => {

            if (err) throw err;

            res.json({ orders: orders.rows, products: products.rows });

        });

    });

});



app.post('/api/orderdetails', (req, res) => {

    const { OrderID, ProductID, Quantity, UnitPrice } = req.body;

    const Subtotal = Quantity * UnitPrice;



    const query = 'INSERT INTO orderdetails (OrderID, ProductID, Quantity, UnitPrice, Subtotal) VALUES ($1, $2, $3, $4, $5)';

    db.query(query, [OrderID, ProductID, Quantity, UnitPrice, Subtotal], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Added successfully!');

    });

});



app.delete('/api/orderdetails/:id', (req, res) => {

    db.query('DELETE FROM orderdetails WHERE OrderDetailID = $1', [req.params.id], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Deleted successfully!');

    });

});



// ==========================================

// PRODUCT MANAGEMENT ROUTES (Inventory)

// ==========================================



app.get('/api/products', (req, res) => {

    db.query('SELECT * FROM product ORDER BY ProductID DESC', (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



app.post('/api/products', (req, res) => {

    const { ProductName, Description, UnitPrice, Category } = req.body;

    const query = 'INSERT INTO product (ProductName, Description, UnitPrice, Category) VALUES ($1, $2, $3, $4)';

    db.query(query, [ProductName, Description, UnitPrice, Category], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Product added!');

    });

});



app.put('/api/products/:id', (req, res) => {

    const { ProductName, Description, UnitPrice, Category } = req.body;

    const query = 'UPDATE product SET ProductName = $1, Description = $2, UnitPrice = $3, Category = $4 WHERE ProductID = $5';

    db.query(query, [ProductName, Description, UnitPrice, Category, req.params.id], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Product updated!');

    });

});



app.delete('/api/products/:id', (req, res) => {

    db.query('DELETE FROM product WHERE ProductID = $1', [req.params.id], (err) => {

        if (err) return res.status(500).send({ error: "Cannot delete product because it is linked to existing orders." });

        res.send('Product deleted!');

    });

});



// ==========================================

// CUSTOMER MANAGEMENT ROUTES

// ==========================================



// GET: All Customers

app.get('/api/customers', (req, res) => {

    db.query('SELECT * FROM customer ORDER BY CustomerID DESC', (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// POST: Add Customer

app.post('/api/customers', (req, res) => {

    const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;

    const query = 'INSERT INTO customer (FirstName, LastName, Email, PhoneNumber, Address) VALUES ($1, $2, $3, $4, $5)';

    db.query(query, [FirstName, LastName, Email, PhoneNumber, Address], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Customer registered!');

    });

});



// PUT: Update Customer (The Alter)

app.put('/api/customers/:id', (req, res) => {

    const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;

    const query = 'UPDATE customer SET FirstName = $1, LastName = $2, Email = $3, PhoneNumber = $4, Address = $5 WHERE CustomerID = $6';

    db.query(query, [FirstName, LastName, Email, PhoneNumber, Address, req.params.id], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Customer details updated!');

    });

});



// DELETE: Remove Customer

app.delete('/api/customers/:id', (req, res) => {

    db.query('DELETE FROM customer WHERE CustomerID = $1', [req.params.id], (err) => {

        if (err) return res.status(500).send({ error: "Cannot delete customer with active order history." });

        res.send('Customer removed!');

    });

});



// ==========================================

// ORDER HEADER ROUTES

// ==========================================



// GET: All Orders with Customer and Employee names

app.get('/api/orders', (req, res) => {

    const query = `

        SELECT

            o.OrderID,

            c.CustomerName,

            e.FirstName || ' ' || e.LastName AS EmployeeName,

            TO_CHAR(o.OrderDate, 'Mon DD, YYYY') as Date,

            o.OrderStatus,

            o.TotalAmount

        FROM "order" o

        JOIN customer c ON o.CustomerID = c.CustomerID

        JOIN employee e ON o.EmployeeID = e.EmployeeID

        ORDER BY o.OrderID DESC

    `;

    db.query(query, (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// POST: Create a new Order record

app.post('/api/orders', (req, res) => {

    const { CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount } = req.body;

    const query = 'INSERT INTO "order" (CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount) VALUES ($1, $2, $3, $4, $5, $6)';

    db.query(query, [CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Order created!');

    });

});



// ==========================================

// EMPLOYEE MANAGEMENT ROUTES

// ==========================================



// GET: All Employees

app.get('/api/employees', (req, res) => {

    db.query('SELECT * FROM employee ORDER BY EmployeeID ASC', (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// POST: Add Employee

app.post('/api/employees', (req, res) => {

    const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;

    const query = 'INSERT INTO employee (FirstName, LastName, Role, ContactNumber, ReportsTo) VALUES ($1, $2, $3, $4, $5)';

    db.query(query, [FirstName, LastName, Role, ContactNumber, ReportsTo || null], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Employee added!');

    });

});



// PUT: Update Employee (The "Alter")

app.put('/api/employees/:id', (req, res) => {

    const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;

    const query = 'UPDATE employee SET FirstName = $1, LastName = $2, Role = $3, ContactNumber = $4, ReportsTo = $5 WHERE EmployeeID = $6';

    db.query(query, [FirstName, LastName, Role, ContactNumber, ReportsTo || null, req.params.id], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Employee updated!');

    });

});



// DELETE: Remove Employee

app.delete('/api/employees/:id', (req, res) => {

    db.query('DELETE FROM employee WHERE EmployeeID = $1', [req.params.id], (err) => {

        if (err) return res.status(500).send({ error: "Cannot delete employee assigned to active orders." });

        res.send('Employee removed!');

    });

});



// ==========================================

// INVENTORY MANAGEMENT ROUTES

// ==========================================



// GET: All Inventory levels with Product Names

app.get('/api/inventory', (req, res) => {

    const query = `

        SELECT

            i.InventoryID,

            p.ProductName,

            i.StockQuantity,

            TO_CHAR(i.LastUpdated, 'Mon DD, YYYY HH24:MI') as LastUpdated

        FROM inventory i

        JOIN product p ON i.ProductID = p.ProductID

        ORDER BY i.InventoryID DESC

    `;

    db.query(query, (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// PUT: Update Stock Level (Restock or Manual Adjustment)

app.put('/api/inventory/:id', (req, res) => {

    const { StockQuantity } = req.body;

    const query = 'UPDATE inventory SET StockQuantity = $1, LastUpdated = current_timestamp WHERE InventoryID = $2';

    db.query(query, [StockQuantity, req.params.id], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Stock updated!');

    });

});



// POST: Link a new product to the inventory tracker

app.post('/api/inventory', (req, res) => {

    const { ProductID, StockQuantity } = req.body;

    const query = 'INSERT INTO inventory (ProductID, StockQuantity, LastUpdated) VALUES ($1, $2, current_timestamp)';

    db.query(query, [ProductID, StockQuantity], (err) => {

        if (err) return res.status(500).send(err);

        res.send('Inventory tracking started for product!');

    });

});



// ==========================================

// PAYMENT MANAGEMENT ROUTES

// ==========================================



// GET: All payments with Order and Customer info

app.get('/api/payments', (req, res) => {

    const query = `

        SELECT

            p.PaymentID,

            p.OrderID,

            c.CustomerName,

            TO_CHAR(p.PaymentDate, 'Mon DD, YYYY HH24:MI') as Date,

            p.PaymentMethod,

            p.AmountPaid,

            p.PaymentStatus

        FROM payment p

        JOIN "order" o ON p.OrderID = o.OrderID

        JOIN customer c ON o.CustomerID = c.CustomerID

        ORDER BY p.PaymentID DESC

    `;

    db.query(query, (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// POST: Record a new payment

app.post('/api/payments', (req, res) => {

    const { OrderID, PaymentMethod, AmountPaid, PaymentStatus } = req.body;

    const query = 'INSERT INTO payment (OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus) VALUES ($1, current_timestamp, $2, $3, $4)';

    db.query(query, [OrderID, PaymentMethod, AmountPaid, PaymentStatus], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Payment recorded!');

    });

});



// ==========================================

// DELIVERY & PICKUP ROUTES

// ==========================================



// GET: All delivery/pickup records

app.get('/api/logistics', (req, res) => {

    const query = `

        SELECT

            dp.DeliveryID,

            dp.OrderID,

            c.CustomerName,

            dp.DeliveryType,

            TO_CHAR(dp.DeliveryDate, 'Mon DD, YYYY') as Date,

            dp.DeliveryStatus

        FROM delivery_pickup dp

        JOIN "order" o ON dp.OrderID = o.OrderID

        JOIN customer c ON o.CustomerID = c.CustomerID

        ORDER BY dp.DeliveryID DESC

    `;

    db.query(query, (err, results) => {

        if (err) return res.status(500).send(err);

        res.json(results.rows);

    });

});



// POST: Schedule a new delivery/pickup

app.post('/api/logistics', (req, res) => {

    const { OrderID, DeliveryType, DeliveryDate, DeliveryStatus } = req.body;

    const query = 'INSERT INTO delivery_pickup (OrderID, DeliveryType, DeliveryDate, DeliveryStatus) VALUES ($1, $2, $3, $4)';

    db.query(query, [OrderID, DeliveryType, DeliveryDate, DeliveryStatus], (err, result) => {

        if (err) return res.status(500).send(err);

        res.send('Logistics record created!');

    });

});

// PUT: Update logistics status
app.put('/api/logistics/:id', (req, res) => {
    const { DeliveryStatus } = req.body;
    const query = 'UPDATE delivery_pickup SET DeliveryStatus = $1 WHERE DeliveryID = $2';
    db.query(query, [DeliveryStatus, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Logistics status updated!');
    });
});

// ==========================================
// DASHBOARD STATS ROUTE
// ==========================================

app.get('/api/dashboard/stats', (req, res) => {
    const query = `
        SELECT
            COALESCE((SELECT SUM(TotalAmount) FROM "order"), 0) AS revenue,
            COALESCE((SELECT COUNT(*) FROM customer), 0) AS customers,
            COALESCE((SELECT COUNT(*) FROM inventory WHERE StockQuantity < 10), 0) AS lowStock
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results.rows[0] || { revenue: 0, customers: 0, lowStock: 0 });
    });
});

// ==========================================
// REPORTS ROUTES
// ==========================================

// GET: Order summary for reports page
app.get('/api/reports/summary', (req, res) => {
    const query = `
        SELECT
            o.OrderID,
            c.CustomerName,
            o.OrderDate,
            o.TotalAmount,
            o.OrderStatus
        FROM "order" o
        JOIN customer c ON o.CustomerID = c.CustomerID
        ORDER BY o.OrderDate DESC
        LIMIT 50
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results.rows);
    });
});

// GET: Inventory status report
app.get('/api/reports/inventory-status', (req, res) => {
    const query = `
        SELECT
            p.ProductID,
            p.ProductName,
            p.Category,
            i.StockQuantity,
            p.UnitPrice
        FROM inventory i
        JOIN product p ON i.ProductID = p.ProductID
        ORDER BY i.StockQuantity ASC, p.ProductName ASC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results.rows);
    });
});

// ==========================================
// SERVER START
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 3000, () => console.log('Server running on port ' + (process.env.PORT || 3000)));
}

// For Vercel deployment
module.exports = app;