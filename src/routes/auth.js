const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: "Preencha email e senha!" });

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado!" });

    const usuario = rows[0];
    const validPassword = await bcrypt.compare(senha, usuario.senha);
    if (!validPassword) return res.status(401).json({ message: "Senha inválida!" });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login realizado com sucesso!",
      user: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      token
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = router;
