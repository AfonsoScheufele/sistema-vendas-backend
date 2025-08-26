const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    const userExists = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email já registrado!" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, hashedPassword]
    );

    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    const validPassword = await bcrypt.compare(senha, user.rows[0].senha);
    if (!validPassword) {
      return res.status(401).json({ message: "Senha inválida!" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ message: "Login realizado!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
