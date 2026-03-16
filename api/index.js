const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// If you use this file (e.g. Vercel Serverless routes), load env vars like the main server.
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const rawDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tesart';
const connectionString = rawDbUrl.replace(/\[|\]/g, '');

const db = new Pool({
  connectionString,
  ssl: connectionString.includes('.supabase.co')
    ? { rejectUnauthorized: false }
    : undefined,
});

// ===== API routes =====

app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customer ORDER BY CustomerID DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/customers', async (req, res) => {
  const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
  try {
    await db.query(
      'INSERT INTO customer (FirstName, LastName, Email, PhoneNumber, Address) VALUES ($1, $2, $3, $4, $5)',
      [FirstName, LastName, Email, PhoneNumber, Address]
    );
    res.send('Customer registered!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { FirstName, LastName, Email, PhoneNumber, Address } = req.body;
  try {
    await db.query(
      'UPDATE customer SET FirstName = $1, LastName = $2, Email = $3, PhoneNumber = $4, Address = $5 WHERE CustomerID = $6',
      [FirstName, LastName, Email, PhoneNumber, Address, req.params.id]
    );
    res.send('Customer details updated!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM customer WHERE CustomerID = $1', [req.params.id]);
    res.send('Customer removed!');
  } catch (err) {
    res.status(500).send({ error: 'Cannot delete customer with active order history.' });
  }
});

// ... other API routes would follow the same pattern ...

module.exports = app;