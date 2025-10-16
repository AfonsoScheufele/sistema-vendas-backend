const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json());

const mockProducts = [];

const mockClients = [];

const mockSales = [];

const mockDashboardStats = {
  totalVendas: 0,
  clientesAtivos: 0,
  produtosEmEstoque: 0,
  vendasHoje: 0,
  faturamentoHoje: 0,
  faturamentoMes: 0,
  crescimentoVendas: 0,
  ticketMedio: 0,
  metaVendas: 0,
  percentualMeta: 0,
  vendasMesAnterior: 0,
  novosClientes: 0,
  clientesInativos: 0
};

app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString(), status: 'OK' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: 'connected',
    services: {
      websocket: 'running',
      redis: 'connected'
    }
  });
});

app.get('/produtos', (req, res) => res.json(mockProducts));
app.get('/api/produtos', (req, res) => res.json(mockProducts));

app.get('/produtos/stats', (req, res) => {
  res.json({
    totalProdutos: 0,
    produtosAtivos: 0,
    produtosInativos: 0,
    produtosEmEstoque: 0,
    produtosSemEstoque: 0,
    produtosComEstoqueBaixo: 0,
    valorTotalEstoque: 0,
    valorMedioProduto: 0,
    produtoMaisVendido: null,
    categoriaMaisVendida: null,
    crescimentoProdutos: 0,
    novosProdutosHoje: 0,
    novosProdutosSemana: 0,
    novosProdutosMes: 0
  });
});

app.get('/clientes', (req, res) => res.json(mockClients));
app.get('/api/clientes', (req, res) => res.json(mockClients));

app.get('/clientes/stats', (req, res) => {
  res.json({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    novosClientesHoje: 0,
    novosClientesSemana: 0,
    novosClientesMes: 0,
    clientesComCompras: 0,
    ticketMedioCliente: 0,
    clienteMaisFiel: null,
    crescimentoClientes: 0
  });
});

app.get('/vendas', (req, res) => res.json(mockSales));
app.get('/api/vendas', (req, res) => res.json(mockSales));

app.get('/vendedores', (req, res) => res.json([]));
app.get('/api/vendedores', (req, res) => res.json([]));

app.get('/comissoes', (req, res) => res.json([]));
app.get('/api/comissoes', (req, res) => res.json([]));

app.get('/dashboard/stats', (req, res) => res.json(mockDashboardStats));

app.get('/dashboard/vendas-mensais', (req, res) => {
  res.json([]);
});

app.get('/dashboard/produtos-mais-vendidos', (req, res) => {
  res.json([]);
});

app.get('/dashboard/faturamento-diario', (req, res) => {
  res.json([]);
});

app.get('/dashboard/distribuicao-categorias', (req, res) => {
  res.json([]);
});

app.get('/dashboard/insights', (req, res) => {
  res.json([]);
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@sistema.com' && password === 'password') {
    return res.json({ token: 'mock-jwt-token', user: { email: 'admin@sistema.com', name: 'Admin User' } });
  }
  res.status(401).json({ message: 'Credenciais inválidas' });
});

app.post('/auth/register', (req, res) => {
  res.json({ message: 'Usuário criado com sucesso', user: { ...req.body, id: Date.now() } });
});

app.get('/auth/me', (req, res) => {
  res.json({
    id: 1,
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'admin'
  });
});

app.get('/notifications', (req, res) => {
  res.json([]);
});

app.post('/notifications', (req, res) => {
  res.json({ message: 'Notificação criada', id: Date.now() });
});

app.get('/estoque/produtos', (req, res) => {
  res.json(mockProducts.map(p => ({
    ...p,
    estoqueAtual: p.estoque,
    estoqueMinimo: 10,
    estoqueMaximo: 100
  })));
});

app.get('/estoque/movimentacoes', (req, res) => {
  res.json([]);
});

app.get('/estoque/transferencias', (req, res) => {
  res.json([]);
});

app.get('/pedidos', (req, res) => {
  res.json([]);
});

app.get('/pedidos/stats', (req, res) => {
  res.json({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosProcessando: 0,
    pedidosConcluidos: 0,
    faturamentoTotal: 0,
    faturamentoMes: 0,
    faturamentoHoje: 0,
    ticketMedio: 0,
    pedidosHoje: 0,
    pedidosSemana: 0,
    pedidosMes: 0,
    crescimentoPedidos: 0,
    tempoMedioEntrega: 0,
    satisfacaoMedia: 0
  });
});

app.get('/orcamentos', (req, res) => {
  res.json([]);
});

app.get('/orcamentos/stats', (req, res) => {
  res.json({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    orcamentosRejeitados: 0,
    valorTotalOrcamentos: 0,
    valorMedioOrcamento: 0,
    taxaConversao: 0,
    orcamentosHoje: 0,
    orcamentosSemana: 0,
    orcamentosMes: 0
  });
});

app.post('/orcamentos', (req, res) => {
  res.json({ message: 'Orçamento criado', id: Date.now(), ...req.body });
});

app.put('/orcamentos/:id', (req, res) => {
  res.json({ message: 'Orçamento atualizado', id: req.params.id, ...req.body });
});

app.delete('/orcamentos/:id', (req, res) => {
  res.json({ message: 'Orçamento deletado', id: req.params.id });
});

app.get('/orcamentos/:id', (req, res) => {
  res.json({ message: 'Orçamento não encontrado', id: req.params.id });
});

app.post('/orcamentos/:id/converter', (req, res) => {
  res.json({ message: 'Orçamento convertido em pedido', id: req.params.id });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
  
  // Enviar heartbeat a cada 30 segundos
  const heartbeat = setInterval(() => {
    socket.emit('heartbeat', { timestamp: new Date().toISOString() });
  }, 30000);
  
  socket.on('disconnect', () => {
    clearInterval(heartbeat);
  });
});

server.listen(PORT, () => {
  console.log("🚀 ==========================================");
  console.log("🚀   SISTEMA DE VENDAS - BACKEND");
  console.log("🚀 ==========================================");
  console.log(`📱 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket disponível em: ws://localhost:${PORT}`);
  console.log("📋 Rotas principais:");
  console.log("   • GET  /test                    - Teste básico");
  console.log("   • GET  /produtos                - Listar produtos");
  console.log("   • GET  /clientes                - Listar clientes");
  console.log("   • GET  /clientes/stats          - Estatísticas clientes");
  console.log("   • GET  /vendas                  - Listar vendas");
  console.log("   • GET  /pedidos                 - Listar pedidos");
  console.log("   • GET  /pedidos/stats           - Estatísticas pedidos");
  console.log("   • GET  /orcamentos              - Listar orçamentos");
  console.log("   • GET  /orcamentos/stats        - Estatísticas orçamentos");
  console.log("   • GET  /estoque/produtos        - Produtos em estoque");
  console.log("   • GET  /notifications           - Notificações");
  console.log("   • GET  /auth/me                 - Usuário atual");
  console.log("   • GET  /dashboard/stats         - Estatísticas gerais");
  console.log("   • GET  /dashboard/vendas-mensais - Vendas mensais");
  console.log("   • GET  /dashboard/produtos-mais-vendidos - Top produtos");
  console.log("   • GET  /dashboard/faturamento-diario - Faturamento diário");
  console.log("   • GET  /dashboard/distribuicao-categorias - Distribuição");
  console.log("   • GET  /dashboard/insights      - Insights");
  console.log("   • POST /auth/login              - Login");
  console.log("🔐 Login: admin@sistema.com / password");
  console.log("✅ Backend pronto para uso!");
  console.log("🚀 ==========================================");
});

process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado com sucesso!');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado com sucesso!');
    process.exit(0);
  });
});

setInterval(() => {
  // Heartbeat para manter o processo vivo
}, 1000);