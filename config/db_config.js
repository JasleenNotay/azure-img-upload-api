const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const sslOptions = {
  rejectUnauthorized: false, // Set this to `true` if you want to enforce server certificate validation
  // ca: fs.readFileSync('/path/to/ssl/certificate.pem'), // Path to the SSL certificate file downloaded from Azure
};

const pool = new Pool({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DB_NAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  ssl: sslOptions,
});

module.exports = { pool };
