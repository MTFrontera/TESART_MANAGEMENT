// Test database connection script
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing TiDB connection...');

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

        const connection = await mysql.createConnection(config);
        console.log('✅ TiDB connected successfully!');

        // Test a simple query
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM customer');
        console.log(`✅ Found ${rows[0].count} customers in database`);

        await connection.end();
        console.log('✅ Connection closed successfully');
    } catch (err) {
        console.error('❌ TiDB connection failed:', err.message);
        console.error('Full error:', err);
    }
}

testConnection();