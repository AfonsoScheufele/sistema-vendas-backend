const express = require("express");
const auth = require("../middleware/auth");
const { vendas } = require("../database");
const router = express.Router();

router.get("/", auth, (req, res) => res.json(vendas));

router.post("/", auth, (req, res) => {
  const { clienteId, produtos, total, status } = req.body;
  const nova = { id: vendas.length + 1, clienteId, produtos, total, status, criadoEm: new Date() };
  vendas.push(nova);
  res.json(nova);
});

module.exports = router;
