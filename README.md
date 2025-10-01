# Sistema de Vendas - Backend (API RESTful)

## 🚀 Visão Geral do Projeto

Este repositório contém a **API RESTful** que serve como o núcleo de dados e lógica de negócios para o **Sistema de Vendas**. É um backend construído com **Node.js** e **TypeScript**, projetado para ser robusto, escalável e fornecer todos os endpoints necessários para o frontend (disponível [aqui](https://www.google.com/search?q=https://github.com/AfonsoScheufele/sistema-vendas-frontend - *Link do outro repo*)) gerenciar vendas, produtos, clientes e autenticação.

## ✨ Principais Funcionalidades (Endpoints)

A API é estruturada para gerenciar os principais recursos de um sistema de vendas (funcionalidades presumidas):

| Módulo | Funcionalidades | Endpoints (Exemplo) |
| :--- | :--- | :--- |
| **Autenticação** | Login, Registro e Geração de Tokens JWT. | `POST /api/auth/login` |
| **Produtos** | CRUD completo de itens de estoque. | `GET /api/products`, `POST /api/products` |
| **Clientes** | Cadastro e listagem de informações de clientes. | `GET /api/clients`, `PUT /api/clients/:id` |
| **Vendas** | Criação, consulta e detalhamento de transações de venda. | `POST /api/sales`, `GET /api/sales/:id` |
| **Relatórios** | Endpoints para dados agregados de vendas (Dashboard). | `GET /api/reports/sales-summary` |

-----

## 🛠️ Tecnologias Utilizadas

Este backend utiliza uma stack moderna e amplamente utilizada no ecossistema Node.js:

  * **Linguagem:** **TypeScript** (100%) - Para tipagem forte e melhor organização do código.
  * **Runtime:** **Node.js**
  * **Framework Web:** **Express.js** (ou similar) - Para roteamento e middlewares da API.
  * **Banco de Dados (Presumido):** **PostgreSQL** ou **MongoDB** - Para persistência de dados.
  * **ORM/ODM (Presumido):** **Prisma** ou **TypeORM** - Para interação com o banco de dados.
  * **Execução:** **ts-node** - Para executar arquivos TypeScript diretamente em desenvolvimento.
  * **Autenticação:** **JSON Web Tokens (JWT)** - Para gerenciamento de sessões seguras.

## 📌 Pré-requisitos

Para executar este projeto, você precisará ter instalado:

  * **Node.js:** Versão 18 ou superior.
  * **npm** (Node Package Manager) ou **Yarn** / **pnpm**.
  * Um servidor de **Banco de Dados** (PostgreSQL, MySQL, etc.) configurado e em execução.

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar e iniciar o backend localmente:

### 1\. Clonar o Repositório

```bash
git clone https://github.com/AfonsoScheufele/sistema-vendas-backend.git
cd sistema-vendas-backend
```

### 2\. Instalar Dependências

Utilize seu gerenciador de pacotes preferido:

```bash
npm install
# ou
yarn install
```

### 3\. Configurar Variáveis de Ambiente

Crie um arquivo chamado **`.env`** na raiz do projeto e defina as variáveis de ambiente necessárias. Um arquivo `.env.example` pode ser usado como base.

Exemplo de variáveis cruciais:

```
# Configuração do Servidor
PORT=3000

# Configuração do Banco de Dados (Exemplo com PostgreSQL/Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# Chave Secreta para JWT
JWT_SECRET="sua_chave_secreta_aqui"
```

### 4\. Configurar o Banco de Dados (Se aplicável)

Se o projeto usar um ORM como o Prisma, você precisará configurar o banco e rodar as migrações:

```bash
# Se estiver usando Prisma, o comando pode ser:
npx prisma migrate dev --name init
npx prisma generate
```

-----

## ▶️ Executando o Projeto

### Modo de Desenvolvimento

Para iniciar o servidor com o `ts-node`, que monitora alterações nos arquivos (`hot-reload`):

```bash
npm run dev
# ou o comando explícito no README original:
npx ts-node src/main.ts
```

O servidor estará ativo em `http://localhost:3000` (ou na porta definida em seu `.env`).

### Modo de Produção

Para um ambiente de produção, primeiro compile o código e depois execute o arquivo JavaScript compilado:

```bash
# 1. Compilar o TypeScript para JavaScript
npm run build

# 2. Iniciar o servidor com o Node.js puro
npm run start
```

## 📂 Estrutura do Projeto

A arquitetura do projeto segue o padrão de camadas para melhor separação de responsabilidades:

```
sistema-vendas-backend/
├── src/
│   ├── controllers/   # Lógica de tratamento de requisições (recebe a request, envia a resposta)
│   ├── services/      # Lógica de negócios pura (cálculos, validações, regras)
│   ├── repositories/  # Camada de acesso a dados (interação com o ORM/BD)
│   ├── models/        # Definições de tipos/interfaces e modelos do ORM/DB
│   ├── middlewares/   # Funções para pré-processamento (e.g., autenticação JWT)
│   └── main.ts        # Ponto de entrada da aplicação (configuração do Express)
├── routes/            # Definição das rotas da API
├── .env.example
├── package.json
└── tsconfig.json
```
