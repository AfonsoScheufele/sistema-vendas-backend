require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const authRoutes = require("./src/routes/auth");
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
