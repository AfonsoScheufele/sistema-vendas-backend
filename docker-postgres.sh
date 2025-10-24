#!/bin/bash

# Script para gerenciar o PostgreSQL com Docker

case "$1" in
  start)
    echo "🚀 Iniciando PostgreSQL..."
    docker-compose up -d
    echo "✅ PostgreSQL iniciado na porta 5433"
    ;;
  stop)
    echo "🛑 Parando PostgreSQL..."
    docker-compose down
    echo "✅ PostgreSQL parado"
    ;;
  restart)
    echo "🔄 Reiniciando PostgreSQL..."
    docker-compose down
    docker-compose up -d
    echo "✅ PostgreSQL reiniciado"
    ;;
  status)
    echo "📊 Status do PostgreSQL:"
    docker-compose ps
    ;;
  logs)
    echo "📋 Logs do PostgreSQL:"
    docker-compose logs -f postgres
    ;;
  backup)
    echo "💾 Fazendo backup do banco..."
    docker exec postgres-vendas pg_dump -U postgres vendas_db > backup_$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Backup criado: backup_$(date +%Y%m%d_%H%M%S).sql"
    ;;
  restore)
    if [ -z "$2" ]; then
      echo "❌ Uso: $0 restore <arquivo_backup.sql>"
      exit 1
    fi
    echo "🔄 Restaurando banco de dados..."
    docker exec -i postgres-vendas psql -U postgres vendas_db < "$2"
    echo "✅ Banco restaurado"
    ;;
  *)
    echo "📖 Uso: $0 {start|stop|restart|status|logs|backup|restore}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start    - Inicia o PostgreSQL"
    echo "  stop     - Para o PostgreSQL"
    echo "  restart  - Reinicia o PostgreSQL"
    echo "  status   - Mostra o status do container"
    echo "  logs     - Mostra os logs do PostgreSQL"
    echo "  backup   - Cria um backup do banco"
    echo "  restore  - Restaura um backup do banco"
    exit 1
    ;;
esac


