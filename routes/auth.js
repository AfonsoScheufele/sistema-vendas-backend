const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Usuario = require("../models/Usuario");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) return res.status(401).json({ message: "Email ou senha inválidos" });

  const senhaValida = bcrypt.compareSync(senha, usuario.senhaHash);
  if (!senhaValida) return res.status(401).json({ message: "Email ou senha inválidos" });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

module.exports = router;
