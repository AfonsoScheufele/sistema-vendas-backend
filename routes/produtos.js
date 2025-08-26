const express = require("express");
const auth = require("../middleware/auth");
const { produtos } = require("../database");
const router = express.Router();

router.get("/", auth, (req, res) => res.json(produtos));

router.post("/", auth, (req, res) => {
  const { nome, preco } = req.body;
  const novo = { id: produtos.length + 1, nome, preco };
  produtos.push(novo);
  res.json(novo);
});

module.exports = router;
