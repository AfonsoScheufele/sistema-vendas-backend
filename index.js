const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

// Teste de rota protegida
const authMiddleware = require('./middlewares/authMiddleware');
app.get('/teste', authMiddleware, (req, res) => {
  res.json({ message: 'Você está autenticado!', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
