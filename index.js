const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// TiDB Connection
let db;

async function initializeDB() {
    try {
        // Use individual environment variables for TiDB Cloud
        const config = {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ssl: {
                rejectUnauthorized: false // For TiDB Cloud
            }
        };

        db = await mysql.createConnection(config);
        console.log('TiDB connected');
    } catch (err) {
        console.error('TiDB connection failed:', err.message);
        process.exit(1);
    }
}

async function getNextId(tableName) {
    const [rows] = await db.execute('SELECT MAX(id) as maxId FROM counters WHERE table_name = ?', [tableName]);
    const nextId = (rows[0]?.maxId || 0) + 1;
    await db.execute('INSERT INTO counters (table_name, last_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_id = ?', [tableName, nextId, nextId]);
    return nextId;
}

// ORDER DETAILS ROUTES
app.get('/api/orderdetails', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT od.OrderDetailID, od.OrderID, DATE_FORMAT(o.OrderDate, '%b %d, %Y') as Date,
                   p.ProductName, od.Quantity, od.UnitPrice, od.Subtotal
            FROM orderdetails od
            JOIN orders o ON od.OrderID = o.OrderID
            JOIN products p ON od.ProductID = p.ProductID
            ORDER BY od.OrderDetailID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/api/dropdowns', async (req, res) => {
    try {
        const [orders] = await db.execute('SELECT OrderID FROM orders');
        const [products] = await db.execute('SELECT ProductID, ProductName, UnitPrice FROM products');
        res.json({ orders, products });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/orderdetails', async (req, res) => {
    try {
        const { OrderID, ProductID, Quantity, UnitPrice } = req.body;
        const OrderDetailID = await getNextId('orderdetails');
        await db.execute(
            'INSERT INTO orderdetails (OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal) VALUES (?, ?, ?, ?, ?, ?)',
            [OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Quantity * UnitPrice]
        );
        res.send('Added successfully!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/orderdetails/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM orderdetails WHERE OrderDetailID = ?', [req.params.id]);
        res.send('Deleted successfully!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PRODUCT ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY ProductID DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { ProductName, Description, UnitPrice, Category } = req.body;
        const ProductID = await getNextId('products');
        await db.execute(
            'INSERT INTO products (ProductID, ProductName, Description, UnitPrice, Category) VALUES (?, ?, ?, ?, ?)',
            [ProductID, ProductName, Description, UnitPrice, Category]
        );
        res.send('Product added!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { ProductName, Description, UnitPrice, Category } = req.body;
        await db.execute(
            'UPDATE products SET ProductName = ?, Description = ?, UnitPrice = ?, Category = ? WHERE ProductID = ?',
            [ProductName, Description, UnitPrice, Category, req.params.id]
        );
        res.send('Product updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 FROM orderdetails WHERE ProductID = ? LIMIT 1', [req.params.id]);
        if (rows.length > 0) {
            return res.status(500).send({ error: "Cannot delete product because it is linked to existing orders." });
        }
        await db.execute('DELETE FROM products WHERE ProductID = ?', [req.params.id]);
        res.send('Product deleted!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// CUSTOMER ROUTES
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT *, CONCAT(FirstName, " ", LastName) as CustomerName FROM customers ORDER BY CustomerID DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
        const CustomerID = await getNextId('customers');
        await db.execute(
            'INSERT INTO customers (CustomerID, FirstName, LastName, Email, PhoneNumber, Address) VALUES (?, ?, ?, ?, ?, ?)',
            [CustomerID, FirstName, LastName, Email, PhoneNumber, Address]
        );
        res.send('Customer registered!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
        await db.execute(
            'UPDATE customers SET FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ?, Address = ? WHERE CustomerID = ?',
            [FirstName, LastName, Email, PhoneNumber, Address, req.params.id]
        );
        res.send('Customer details updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 FROM orders WHERE CustomerID = ? LIMIT 1', [req.params.id]);
        if (rows.length > 0) {
            return res.status(500).send({ error: "Cannot delete customer with active order history." });
        }
        await db.execute('DELETE FROM customers WHERE CustomerID = ?', [req.params.id]);
        res.send('Customer removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// ORDER ROUTES
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT o.OrderID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
                   CONCAT(e.FirstName, ' ', e.LastName) as EmployeeName,
                   DATE_FORMAT(o.OrderDate, '%b %d, %Y') as Date,
                   o.OrderStatus, o.TotalAmount
            FROM orders o
            JOIN customers c ON o.CustomerID = c.CustomerID
            JOIN employees e ON o.EmployeeID = e.EmployeeID
            ORDER BY o.OrderID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount } = req.body;
        const OrderID = await getNextId('orders');
        await db.execute(
            'INSERT INTO orders (OrderID, CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [OrderID, CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount]
        );
        res.send('Order created!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// EMPLOYEE ROUTES
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM employees ORDER BY EmployeeID ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;
        const EmployeeID = await getNextId('employees');
        await db.execute(
            'INSERT INTO employees (EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo) VALUES (?, ?, ?, ?, ?, ?)',
            [EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo || null]
        );
        res.send('Employee added!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;
        await db.execute(
            'UPDATE employees SET FirstName = ?, LastName = ?, Role = ?, ContactNumber = ?, ReportsTo = ? WHERE EmployeeID = ?',
            [FirstName, LastName, Role, ContactNumber, ReportsTo || null, req.params.id]
        );
        res.send('Employee updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 FROM orders WHERE EmployeeID = ? LIMIT 1', [req.params.id]);
        if (rows.length > 0) {
            return res.status(500).send({ error: "Cannot delete employee assigned to active orders." });
        }
        await db.execute('DELETE FROM employees WHERE EmployeeID = ?', [req.params.id]);
        res.send('Employee removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// INVENTORY ROUTES
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT i.InventoryID, p.ProductName, i.StockQuantity,
                   DATE_FORMAT(i.LastUpdated, '%b %d, %Y %H:%i') as LastUpdated
            FROM inventory i
            JOIN products p ON i.ProductID = p.ProductID
            ORDER BY i.InventoryID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { StockQuantity } = req.body;
        await db.execute(
            'UPDATE inventory SET StockQuantity = ?, LastUpdated = NOW() WHERE InventoryID = ?',
            [StockQuantity, req.params.id]
        );
        res.send('Stock updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM inventory WHERE InventoryID = ?', [req.params.id]);
        res.send('Inventory tracking removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const { ProductID, StockQuantity } = req.body;
        const InventoryID = await getNextId('inventory');
        await db.execute(
            'INSERT INTO inventory (InventoryID, ProductID, StockQuantity, LastUpdated) VALUES (?, ?, ?, NOW())',
            [InventoryID, ProductID, StockQuantity]
        );
        res.send('Inventory tracking started for product!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PAYMENT ROUTES
app.get('/api/payments', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.PaymentID, p.OrderID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
                   DATE_FORMAT(p.PaymentDate, '%b %d, %Y %H:%i') as Date,
                   p.PaymentMethod, p.AmountPaid, p.PaymentStatus
            FROM payments p
            JOIN orders o ON p.OrderID = o.OrderID
            JOIN customers c ON o.CustomerID = c.CustomerID
            ORDER BY p.PaymentID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { OrderID, PaymentMethod, AmountPaid, PaymentStatus } = req.body;
        const PaymentID = await getNextId('payments');
        await db.execute(
            'INSERT INTO payments (PaymentID, OrderID, PaymentDate, PaymentMethod, AmountPaid, PaymentStatus) VALUES (?, ?, NOW(), ?, ?, ?)',
            [PaymentID, OrderID, PaymentMethod, AmountPaid, PaymentStatus]
        );
        res.send('Payment recorded!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// LOGISTICS ROUTES
app.get('/api/logistics', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT d.DeliveryID, d.OrderID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
                   d.DeliveryType, DATE_FORMAT(d.DeliveryDate, '%b %d, %Y') as Date, d.DeliveryStatus
            FROM delivery_pickup d
            JOIN orders o ON d.OrderID = o.OrderID
            JOIN customers c ON o.CustomerID = c.CustomerID
            ORDER BY d.DeliveryID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/logistics', async (req, res) => {
    try {
        const { OrderID, DeliveryType, DeliveryDate, DeliveryStatus } = req.body;
        const DeliveryID = await getNextId('delivery_pickup');
        await db.execute(
            'INSERT INTO delivery_pickup (DeliveryID, OrderID, DeliveryType, DeliveryDate, DeliveryStatus) VALUES (?, ?, ?, ?, ?)',
            [DeliveryID, OrderID, DeliveryType, DeliveryDate, DeliveryStatus]
        );
        res.send('Logistics record created!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/logistics/:id', async (req, res) => {
    try {
        const { DeliveryStatus } = req.body;
        await db.execute(
            'UPDATE delivery_pickup SET DeliveryStatus = ? WHERE DeliveryID = ?',
            [DeliveryStatus, req.params.id]
        );
        res.send('Logistics status updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [revenueRows] = await db.execute('SELECT SUM(TotalAmount) as total FROM orders');
        const [customerRows] = await db.execute('SELECT COUNT(*) as count FROM customers');
        const [lowStockRows] = await db.execute('SELECT COUNT(*) as count FROM inventory WHERE StockQuantity < 10');

        res.json({
            Revenue: revenueRows[0].total || 0,
            Customers: customerRows[0].count,
            LowStock: lowStockRows[0].count
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// REPORTS
app.get('/api/reports/summary', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT o.OrderID, CONCAT(c.FirstName, ' ', c.LastName) as CustomerName,
                   o.OrderDate, o.TotalAmount, o.OrderStatus
            FROM orders o
            JOIN customers c ON o.CustomerID = c.CustomerID
            ORDER BY o.OrderDate DESC
            LIMIT 50
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/api/reports/inventory-status', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.ProductID, p.ProductName, p.Category, i.StockQuantity, p.UnitPrice
            FROM inventory i
            JOIN products p ON i.ProductID = p.ProductID
            ORDER BY i.StockQuantity ASC, p.ProductName ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// SERVER
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/ping', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ ok: false, error: 'Database not initialized' });
        await db.execute('SELECT 1');
        res.json({ ok: true, message: 'Database connection OK' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.get('/:page', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
    res.sendFile(filePath, err => {
        if (err) return next();
    });
});

initializeDB().then(() => {
    if (!process.env.VERCEL) {
        app.listen(process.env.PORT || 3000, () => console.log('Server on port ' + (process.env.PORT || 3000)));
    }
}).catch(err => {
    console.error('Failed to initialize:', err);
    process.exit(1);
});

module.exports = app;
