const pool = require('../../db');

async function getProdutos(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM produto');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarProduto(req, res) {
  try {
    const { nome, descricao, preco, estoque, categoria } = req.body;
    const query = `
      INSERT INTO produto (nome, descricao, preco, estoque, categoria)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [nome, descricao, preco, estoque, categoria];
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProdutos, criarProduto };
