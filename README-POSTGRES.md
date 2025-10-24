# Sistema de Gerenciamento de Vendas - PostgreSQL

## 🐘 Configuração do PostgreSQL

O sistema foi migrado do SQLite para PostgreSQL usando Docker para facilitar o gerenciamento.

### 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ 
- npm ou yarn

### 🚀 Como usar

#### 1. Iniciar o PostgreSQL
```bash
# Usando o script helper
./docker-postgres.sh start

# Ou usando docker-compose diretamente
docker-compose up -d
```

#### 2. Verificar status
```bash
./docker-postgres.sh status
```

#### 3. Iniciar o backend
```bash
npm run start:dev
```

#### 4. Popular o banco com dados iniciais
```bash
npm run seed
```

### 🔧 Comandos úteis

```bash
# Parar o PostgreSQL
./docker-postgres.sh stop

# Reiniciar o PostgreSQL
./docker-postgres.sh restart

# Ver logs do PostgreSQL
./docker-postgres.sh logs

# Fazer backup do banco
./docker-postgres.sh backup

# Restaurar backup
./docker-postgres.sh restore backup_20241022_230253.sql
```

### 📊 Dados iniciais

Após executar o seed, você terá:

- **Admin**: CPF `08551935909`, senha `123456`
- **Vendedor**: email `vendedor@axora.com`, senha `123456`
- **5 produtos** de exemplo
- **4 clientes** de exemplo

### 🔗 Configuração

O banco está configurado para:
- **Host**: localhost
- **Porta**: 5433
- **Usuário**: postgres
- **Senha**: 123456
- **Database**: vendas_db

### 📁 Arquivos importantes

- `docker-compose.yml` - Configuração do PostgreSQL
- `docker-postgres.sh` - Script helper para gerenciar o Docker
- `.env` - Variáveis de ambiente do backend

### 🆘 Solução de problemas

#### PostgreSQL não inicia
```bash
# Verificar se a porta 5433 está livre
netstat -tulpn | grep 5433

# Parar containers conflitantes
docker stop postgres-vendas-new
docker rm postgres-vendas-new
```

#### Backend não conecta
```bash
# Verificar se o PostgreSQL está rodando
./docker-postgres.sh status

# Ver logs do PostgreSQL
./docker-postgres.sh logs
```

#### Resetar banco de dados
```bash
# Parar e remover volumes
docker-compose down -v

# Iniciar novamente
docker-compose up -d

# Executar seed
npm run seed
```


