// database/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Conectado ao banco de dados PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Erro no pool do banco de dados:", err);
});

module.exports = pool;
