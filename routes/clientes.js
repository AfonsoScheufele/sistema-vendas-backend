const express = require("express");
const auth = require("../middleware/auth");
const { clientes } = require("../database");
const router = express.Router();

router.get("/", auth, (req, res) => res.json(clientes));

router.post("/", auth, (req, res) => {
  const { nome } = req.body;
  const novo = { id: clientes.length + 1, nome };
  clientes.push(novo);
  res.json(novo);
});

module.exports = router;
