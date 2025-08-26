const express = require('express');
const router = express.Router();
const { getProdutos, criarProduto } = require('../controllers/produtos.Controller');

router.get('/', getProdutos);
router.post('/', criarProduto);

module.exports = router;
