const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "2904",
  database: "aplikasi_penjualan",
  host: "localhost",
  port: 5432,
});

module.exports = pool;
