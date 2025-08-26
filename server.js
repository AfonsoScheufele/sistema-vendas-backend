// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3001;
const SECRET = "minha_chave_secreta"; // trocar por variável de ambiente em produção

app.use(cors());
app.use(bodyParser.json());

// Usuários de exemplo (normalmente vem do banco)
const usuarios = [
  { id: 1, email: "admin@admin.com", senhaHash: bcrypt.hashSync("123456", 8), nome: "Admin" }
];

// Endpoint de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return res.status(401).json({ message: "Email ou senha inválidos" });

  const senhaValida = bcrypt.compareSync(senha, usuario.senhaHash);
  if (!senhaValida) return res.status(401).json({ message: "Email ou senha inválidos" });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: "1h" });
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

// Middleware para proteger rotas
function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token necessário" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

// Exemplo de rota protegida
app.get("/dashboard", auth, (req, res) => {
  res.json({ message: `Bem-vindo ${req.usuario.email}` });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
