const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const sslOptions = {
  rejectUnauthorized: false, // Set this to `true` if you want to enforce server certificate validation
  // ca: fs.readFileSync('/path/to/ssl/certificate.pem'), // Path to the SSL certificate file downloaded from Azure
};

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: sslOptions,
});

module.exports = { pool };
