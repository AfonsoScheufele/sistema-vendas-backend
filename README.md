# 🚀 Sistema de Vendas AXORA - Backend

Backend completo para sistema de gerenciamento de vendas desenvolvido com NestJS, TypeORM e PostgreSQL.

## ✨ Funcionalidades

### 🏪 **Gestão de Produtos**
- CRUD completo com controle de estoque
- Categorização e marcação de produtos
- Controle de estoque mínimo
- Gestão de preços (venda e custo)
- Códigos de barras e SKU
- Dimensões e peso dos produtos

### 👥 **Gestão de Clientes**
- Cadastro completo de clientes (PF e PJ)
- Endereços e dados de contato
- Histórico de vendas por cliente
- Segmentação por tipo de cliente

### 💰 **Sistema de Vendas**
- Processamento de vendas com itens
- Cálculo automático de totais e descontos
- Controle de comissões
- Múltiplas formas de pagamento
- Relatórios de vendas por vendedor

### 📦 **Gestão de Pedidos**
- Sistema completo de pedidos
- Controle de status
- Gestão de entregas
- Histórico de pedidos

### 📊 **Dashboard Executivo**
- Métricas em tempo real
- Vendas mensais e diárias
- Produtos mais vendidos
- Distribuição por categorias
- Insights e alertas

### 🔐 **Autenticação & Autorização**
- JWT Authentication
- Controle de roles (Admin, Vendedor, User)
- Recuperação de senha
- Perfis de usuário

### 📢 **Sistema de Notificações**
- Notificações em tempo real
- Alertas de estoque baixo
- Notificações de vendas

### 🏢 **Módulos Adicionais**
- **CRM**: Leads e oportunidades
- **Orçamentos**: Sistema de orçamentos
- **Fornecedores**: Gestão de fornecedores
- **Cotações**: Sistema de cotações
- **Estoque**: Controle de movimentações
- **Financeiro**: Controle financeiro
- **Fiscal**: Notas fiscais
- **Logística**: Transportadoras e expedição

## 🛠️ Tecnologias

### **Backend Core**
- **NestJS** - Framework Node.js robusto
- **TypeScript** - Tipagem estática
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal

### **Autenticação & Segurança**
- **JWT** - JSON Web Tokens
- **Passport** - Estratégias de autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-Origin Resource Sharing

### **Validação & DTOs**
- **class-validator** - Validação de dados
- **class-transformer** - Transformação de objetos

### **Desenvolvimento**
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Jest** - Testes unitários

## 📋 Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (v12 ou superior)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/AfonsoScheufele/sistema-vendas-backend.git
cd sistema-vendas-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
```

### 5. Execute o seed para dados iniciais
```bash
npm run seed
```

## 🚀 Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run start:prod
```

O servidor será iniciado em `http://localhost:5000`

## 📚 Endpoints da API

### 🔐 Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /auth/me` - Perfil do usuário logado
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout
- `POST /auth/recuperar-senha` - Solicitar recuperação de senha
- `POST /auth/redefinir-senha` - Redefinir senha
- `POST /auth/change-password` - Alterar senha

### 🏪 Produtos
- `GET /produtos` - Listar produtos (com filtros)
- `GET /produtos/categorias` - Listar categorias
- `GET /produtos/estoque-baixo` - Produtos com estoque baixo
- `GET /produtos/stats` - Estatísticas de produtos
- `GET /produtos/:id` - Buscar produto por ID
- `POST /produtos` - Criar produto
- `PUT /produtos/:id` - Atualizar produto
- `PATCH /produtos/:id/estoque` - Atualizar estoque
- `DELETE /produtos/:id` - Deletar produto
- `GET /api/produtos` - Listar produtos (compatibilidade)

### 👥 Clientes
- `GET /clientes` - Listar clientes (com filtros)
- `GET /clientes/stats` - Estatísticas de clientes
- `GET /clientes/tipos` - Tipos de clientes
- `GET /clientes/novos` - Novos clientes por período
- `GET /clientes/:id` - Buscar cliente por ID
- `GET /clientes/:id/vendas` - Vendas do cliente
- `POST /clientes` - Criar cliente
- `PATCH /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Deletar cliente
- `GET /api/clientes` - Listar clientes (compatibilidade)

### 💰 Vendas
- `GET /vendas` - Listar vendas (com filtros)
- `GET /vendas/stats` - Estatísticas de vendas
- `GET /vendas/vendedores` - Lista de vendedores
- `GET /vendas/comissoes` - Relatório de comissões
- `GET /vendas/relatorio` - Relatório de vendas
- `GET /vendas/:id` - Buscar venda por ID
- `POST /vendas` - Criar venda
- `DELETE /vendas/:id` - Deletar venda
- `GET /api/vendas` - Listar vendas (compatibilidade)

### 📦 Pedidos
- `GET /pedidos` - Listar pedidos (com filtros)
- `GET /pedidos/stats` - Estatísticas de pedidos
- `GET /pedidos/:id` - Buscar pedido por ID
- `POST /pedidos` - Criar pedido
- `PATCH /pedidos/:id` - Atualizar pedido
- `DELETE /pedidos/:id` - Deletar pedido
- `GET /api/pedidos` - Listar pedidos (compatibilidade)

### 📊 Dashboard
- `GET /dashboard/stats` - Estatísticas gerais
- `GET /dashboard/vendas-mensais` - Vendas por mês
- `GET /dashboard/produtos-mais-vendidos` - Produtos mais vendidos
- `GET /dashboard/faturamento-diario` - Faturamento diário
- `GET /dashboard/distribuicao-categorias` - Distribuição por categoria
- `GET /dashboard/insights` - Insights e alertas
- `GET /dashboard/resumo` - Resumo executivo
- `GET /dashboard/metas` - Metas e objetivos
- `GET /dashboard/alertas` - Alertas do sistema
- `GET /api/dashboard/*` - Endpoints de compatibilidade

### 📢 Notificações
- `GET /notifications` - Listar notificações do usuário
- `GET /notifications/unread-count` - Contador de não lidas
- `PATCH /notifications/:id/read` - Marcar como lida
- `POST /notifications/mark-all-read` - Marcar todas como lidas
- `DELETE /notifications/:id` - Deletar notificação

### 🏢 Módulos Adicionais
- **CRM**: `/crm/leads`, `/crm/oportunidades`
- **Orçamentos**: `/orcamentos`
- **Fornecedores**: `/fornecedores`
- **Cotações**: `/cotacoes`
- **Estoque**: `/estoque`
- **Financeiro**: `/financeiro`
- **Fiscal**: `/fiscal`
- **Logística**: `/logistica`

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados (Supabase)
DB_HOST=db.ejiyizaxmdfqqwpmchxe.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres

# JWT
JWT_SECRET=meu_jwt_secret_super_seguro_2024_sistema_vendas

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run start:dev        # Inicia com watch mode
npm run start:debug      # Inicia em modo debug

# Produção
npm run build           # Compila o projeto
npm run start:prod      # Inicia em produção

# Banco de Dados
npm run seed            # Popula banco com dados de exemplo

# Qualidade de Código
npm run lint            # Executa ESLint
npm run format          # Formata código com Prettier

# Testes
npm run test            # Executa testes
npm run test:watch      # Executa testes em watch mode
npm run test:cov        # Executa testes com coverage
```

## 📊 Dados de Exemplo

Após executar `npm run seed`, você terá:

- **👤 Usuários**:
  - Admin: `admin@axora.com` (senha: `123456`)
  - Vendedor: `vendedor@axora.com` (senha: `123456`)

- **📦 Produtos**: 5 produtos de exemplo
- **👥 Clientes**: 4 clientes de exemplo (PF e PJ)

## 🔗 Integração com Frontend

Este backend é totalmente compatível com o frontend em:
- [sistema-vendas-frontend](https://github.com/AfonsoScheufele/sistema-vendas-frontend)

### Configuração CORS
O backend está configurado para aceitar requisições de:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Create React App)
- `http://localhost:8080` (Vue.js)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@axora.com
- 🐛 Issues: [GitHub Issues](https://github.com/AfonsoScheufele/sistema-vendas-backend/issues)

---

**Desenvolvido com ❤️ pela equipe AXORA**
- `POST /notifications` - Criar notificação

### Estoque
- `GET /estoque/produtos` - Produtos em estoque

### Teste
- `GET /test` - Teste básico do servidor

## 🔐 Login

Use as seguintes credenciais para fazer login:
- **Email**: `admin@sistema.com`
- **Senha**: `password`

## 📄 Licença

Este projeto está sob a licença ISC.