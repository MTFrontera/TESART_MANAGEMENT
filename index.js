const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/tesart';
const client = new MongoClient(mongoUrl);

let db;
let collections = {};

async function initializeDB() {
    try {
        await client.connect();
        db = client.db();
        
        collections = {
            customers: db.collection('customer'),
            employees: db.collection('employee'),
            products: db.collection('product'),
            orders: db.collection('order'),
            orderdetails: db.collection('orderdetails'),
            inventory: db.collection('inventory'),
            payments: db.collection('payment'),
            delivery: db.collection('delivery_pickup'),
            counters: db.collection('counters')
        };
        
        console.log('MongoDB connected');
        
        for (const [key, val] of Object.entries({
            CustomerID: 5, EmployeeID: 7, ProductID: 16,
            OrderID: 5, OrderDetailID: 6, InventoryID: 6,
            PaymentID: 3, DeliveryID: 2
        })) {
            if (!await collections.counters.findOne({ _id: key })) {
                await collections.counters.insertOne({ _id: key, seq: val });
            }
        }
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

async function getNextId(counterName) {
    const result = await collections.counters.findOneAndUpdate(
        { _id: counterName },
        { $inc: { seq: 1 } },
        { returnDocument: 'after' }
    );
    return result.value?.seq || 1;
}

// ORDER DETAILS ROUTES
app.get('/api/orderdetails', async (req, res) => {
    try {
        const results = await collections.orderdetails.aggregate([
            { $lookup: { from: 'order', localField: 'OrderID', foreignField: 'OrderID', as: 'order' } },
            { $unwind: '$order' },
            { $lookup: { from: 'product', localField: 'ProductID', foreignField: 'ProductID', as: 'product' } },
            { $unwind: '$product' },
            { $project: { OrderDetailID: 1, OrderID: 1, Date: { $dateToString: { format: '%b %d, %Y', date: '$order.OrderDate' } }, ProductName: '$product.ProductName', Quantity: 1, UnitPrice: 1, Subtotal: 1 } },
            { $sort: { OrderDetailID: -1 } }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/api/dropdowns', async (req, res) => {
    try {
        const orders = await collections.orders.find({}, { projection: { OrderID: 1 } }).toArray();
        const products = await collections.products.find({}, { projection: { ProductID: 1, ProductName: 1, UnitPrice: 1 } }).toArray();
        res.json({ orders, products });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/orderdetails', async (req, res) => {
    try {
        const { OrderID, ProductID, Quantity, UnitPrice } = req.body;
        const OrderDetailID = await getNextId('OrderDetailID');
        await collections.orderdetails.insertOne({ OrderDetailID, OrderID, ProductID, Quantity, UnitPrice, Subtotal: Quantity * UnitPrice });
        res.send('Added successfully!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/orderdetails/:id', async (req, res) => {
    try {
        await collections.orderdetails.deleteOne({ OrderDetailID: parseInt(req.params.id) });
        res.send('Deleted successfully!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PRODUCT ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const results = await collections.products.find({}).sort({ ProductID: -1 }).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { ProductName, Description, UnitPrice, Category } = req.body;
        const ProductID = await getNextId('ProductID');
        await collections.products.insertOne({ ProductID, ProductName, Description, UnitPrice, Category });
        res.send('Product added!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { ProductName, Description, UnitPrice, Category } = req.body;
        await collections.products.updateOne({ ProductID: parseInt(req.params.id) }, { $set: { ProductName, Description, UnitPrice, Category } });
        res.send('Product updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        if (await collections.orderdetails.findOne({ ProductID: parseInt(req.params.id) })) {
            return res.status(500).send({ error: "Cannot delete product because it is linked to existing orders." });
        }
        await collections.products.deleteOne({ ProductID: parseInt(req.params.id) });
        res.send('Product deleted!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// CUSTOMER ROUTES
app.get('/api/customers', async (req, res) => {
    try {
        const results = await collections.customers.find({}).sort({ CustomerID: -1 }).toArray();
        const data = results.map(c => ({ ...c, CustomerName: `${c.FirstName} ${c.LastName}` }));
        res.json(data);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
        const CustomerID = await getNextId('CustomerID');
        await collections.customers.insertOne({ CustomerID, FirstName, LastName, Email, PhoneNumber, Address });
        res.send('Customer registered!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
        await collections.customers.updateOne({ CustomerID: parseInt(req.params.id) }, { $set: { FirstName, LastName, Email, PhoneNumber, Address } });
        res.send('Customer details updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        if (await collections.orders.findOne({ CustomerID: parseInt(req.params.id) })) {
            return res.status(500).send({ error: "Cannot delete customer with active order history." });
        }
        await collections.customers.deleteOne({ CustomerID: parseInt(req.params.id) });
        res.send('Customer removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// ORDER ROUTES
app.get('/api/orders', async (req, res) => {
    try {
        const results = await collections.orders.aggregate([
            { $lookup: { from: 'customer', localField: 'CustomerID', foreignField: 'CustomerID', as: 'customer' } },
            { $unwind: '$customer' },
            { $lookup: { from: 'employee', localField: 'EmployeeID', foreignField: 'EmployeeID', as: 'employee' } },
            { $unwind: '$employee' },
            { $project: { OrderID: 1, CustomerName: { $concat: ['$customer.FirstName', ' ', '$customer.LastName'] }, EmployeeName: { $concat: ['$employee.FirstName', ' ', '$employee.LastName'] }, Date: { $dateToString: { format: '%b %d, %Y', date: '$OrderDate' } }, OrderStatus: 1, TotalAmount: 1 } }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { CustomerID, EmployeeID, OrderDate, OrderStatus, DeliveryMethod, TotalAmount } = req.body;
        const OrderID = await getNextId('OrderID');
        await collections.orders.insertOne({ OrderID, CustomerID, EmployeeID, OrderDate: new Date(OrderDate), OrderStatus, DeliveryMethod, TotalAmount });
        res.send('Order created!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// EMPLOYEE ROUTES
app.get('/api/employees', async (req, res) => {
    try {
        const results = await collections.employees.find({}).sort({ EmployeeID: 1 }).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;
        const EmployeeID = await getNextId('EmployeeID');
        await collections.employees.insertOne({ EmployeeID, FirstName, LastName, Role, ContactNumber, ReportsTo: ReportsTo || null });
        res.send('Employee added!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const { FirstName, LastName, Role, ContactNumber, ReportsTo } = req.body;
        await collections.employees.updateOne({ EmployeeID: parseInt(req.params.id) }, { $set: { FirstName, LastName, Role, ContactNumber, ReportsTo: ReportsTo || null } });
        res.send('Employee updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        if (await collections.orders.findOne({ EmployeeID: parseInt(req.params.id) })) {
            return res.status(500).send({ error: "Cannot delete employee assigned to active orders." });
        }
        await collections.employees.deleteOne({ EmployeeID: parseInt(req.params.id) });
        res.send('Employee removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// INVENTORY ROUTES
app.get('/api/inventory', async (req, res) => {
    try {
        const results = await collections.inventory.aggregate([
            { $lookup: { from: 'product', localField: 'ProductID', foreignField: 'ProductID', as: 'product' } },
            { $unwind: '$product' },
            { $project: { InventoryID: 1, ProductName: '$product.ProductName', StockQuantity: 1, LastUpdated: { $dateToString: { format: '%b %d, %Y %H:%M', date: '$LastUpdated' } } } }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { StockQuantity } = req.body;
        await collections.inventory.updateOne({ InventoryID: parseInt(req.params.id) }, { $set: { StockQuantity, LastUpdated: new Date() } });
        res.send('Stock updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await collections.inventory.deleteOne({ InventoryID: parseInt(req.params.id) });
        res.send('Inventory tracking removed!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const { ProductID, StockQuantity } = req.body;
        const InventoryID = await getNextId('InventoryID');
        await collections.inventory.insertOne({ InventoryID, ProductID, StockQuantity, LastUpdated: new Date() });
        res.send('Inventory tracking started for product!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PAYMENT ROUTES
app.get('/api/payments', async (req, res) => {
    try {
        const results = await collections.payments.aggregate([
            { $lookup: { from: 'order', localField: 'OrderID', foreignField: 'OrderID', as: 'order' } },
            { $unwind: '$order' },
            { $lookup: { from: 'customer', localField: 'order.CustomerID', foreignField: 'CustomerID', as: 'customer' } },
            { $unwind: '$customer' },
            { $project: { PaymentID: 1, OrderID: 1, CustomerName: { $concat: ['$customer.FirstName', ' ', '$customer.LastName'] }, Date: { $dateToString: { format: '%b %d, %Y %H:%M', date: '$PaymentDate' } }, PaymentMethod: 1, AmountPaid: 1, PaymentStatus: 1 } }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { OrderID, PaymentMethod, AmountPaid, PaymentStatus } = req.body;
        const PaymentID = await getNextId('PaymentID');
        await collections.payments.insertOne({ PaymentID, OrderID, PaymentDate: new Date(), PaymentMethod, AmountPaid, PaymentStatus });
        res.send('Payment recorded!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// LOGISTICS ROUTES
app.get('/api/logistics', async (req, res) => {
    try {
        const results = await collections.delivery.aggregate([
            { $lookup: { from: 'order', localField: 'OrderID', foreignField: 'OrderID', as: 'order' } },
            { $unwind: '$order' },
            { $lookup: { from: 'customer', localField: 'order.CustomerID', foreignField: 'CustomerID', as: 'customer' } },
            { $unwind: '$customer' },
            { $project: { DeliveryID: 1, OrderID: 1, CustomerName: { $concat: ['$customer.FirstName', ' ', '$customer.LastName'] }, DeliveryType: 1, Date: { $dateToString: { format: '%b %d, %Y', date: '$DeliveryDate' } }, DeliveryStatus: 1 } }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/api/logistics', async (req, res) => {
    try {
        const { OrderID, DeliveryType, DeliveryDate, DeliveryStatus } = req.body;
        const DeliveryID = await getNextId('DeliveryID');
        await collections.delivery.insertOne({ DeliveryID, OrderID, DeliveryType, DeliveryDate: new Date(DeliveryDate), DeliveryStatus });
        res.send('Logistics record created!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/api/logistics/:id', async (req, res) => {
    try {
        const { DeliveryStatus } = req.body;
        await collections.delivery.updateOne({ DeliveryID: parseInt(req.params.id) }, { $set: { DeliveryStatus } });
        res.send('Logistics status updated!');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const revenue = await collections.orders.aggregate([{ $group: { _id: null, total: { $sum: '$TotalAmount' } } }]).toArray();
        const customers = await collections.customers.countDocuments();
        const lowStock = await collections.inventory.countDocuments({ StockQuantity: { $lt: 10 } });
        res.json({ Revenue: revenue[0]?.total || 0, Customers: customers, LowStock: lowStock });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// REPORTS
app.get('/api/reports/summary', async (req, res) => {
    try {
        const results = await collections.orders.aggregate([
            { $lookup: { from: 'customer', localField: 'CustomerID', foreignField: 'CustomerID', as: 'customer' } },
            { $unwind: '$customer' },
            { $project: { OrderID: 1, CustomerName: { $concat: ['$customer.FirstName', ' ', '$customer.LastName'] }, OrderDate: 1, TotalAmount: 1, OrderStatus: 1 } },
            { $sort: { OrderDate: -1 } },
            { $limit: 50 }
        ]).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/api/reports/inventory-status', async (req, res) => {
    try {
        const results = await collections.inventory.aggregate([
            { $lookup: { from: 'product', localField: 'ProductID', foreignField: 'ProductID', as: 'product' } },
            { $unwind: '$product' },
            { $project: { ProductID: '$product.ProductID', ProductName: '$product.ProductName', Category: '$product.Category', StockQuantity: 1, UnitPrice: '$product.UnitPrice' } },
            { $sort: { StockQuantity: 1, ProductName: 1 } }
        ]).toArray();
        res.json(results);
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
        await db.admin().ping();
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
