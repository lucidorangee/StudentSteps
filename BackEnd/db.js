require("dotenv").config();

const Pool = require('pg').Pool;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
console.log(process.env.DB_DATABASE + "  " + process.env.DB_PASSWORD);

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});

module.exports = pool;  