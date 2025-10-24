-- Script de inicialização do banco de dados
-- Execute este script após criar o banco de dados

-- Inserir usuário administrador padrão
-- CPF: 12345678901, Senha: admin123
INSERT INTO usuarios (name, cpf, email, senha, role, ativo, "dataCriacao", "dataAtualizacao") 
VALUES ('Administrador', '12345678901', 'admin@sistema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;
