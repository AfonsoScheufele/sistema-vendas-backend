import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from './produtos/produto.entity';
import { Cliente } from './clientes/cliente.entity';
import { Usuario } from './auth/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const produtoRepo = app.get<Repository<Produto>>(getRepositoryToken(Produto));
  const clienteRepo = app.get<Repository<Cliente>>(getRepositoryToken(Cliente));
  const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));

  try {
    // Criar usuário admin
    const adminExists = await usuarioRepo.findOne({ where: { email: 'admin@axora.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const admin = usuarioRepo.create({
        name: 'Administrador',
        email: 'admin@axora.com',
        senha: hashedPassword,
        role: 'Admin',
        ativo: true
      });
      await usuarioRepo.save(admin);
      console.log('✅ Usuário admin criado');
    }

    // Criar vendedor
    const vendedorExists = await usuarioRepo.findOne({ where: { email: 'vendedor@axora.com' } });
    if (!vendedorExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const vendedor = usuarioRepo.create({
        name: 'João Vendedor',
        email: 'vendedor@axora.com',
        senha: hashedPassword,
        role: 'Vendedor',
        ativo: true
      });
      await usuarioRepo.save(vendedor);
      console.log('✅ Usuário vendedor criado');
    }

    // Criar produtos de exemplo
    const produtosExemplo = [
      {
        nome: 'Notebook Dell Inspiron',
        descricao: 'Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, SSD 256GB',
        preco: 2999.90,
        precoCusto: 2200.00,
        estoque: 15,
        estoqueMinimo: 5,
        categoria: 'Informática',
        codigoBarras: '7891234567890',
        sku: 'NB-DELL-001',
        unidade: 'UN',
        marca: 'Dell',
        modelo: 'Inspiron 15 3000',
        peso: 2.2,
        ativo: true
      },
      {
        nome: 'Mouse Logitech MX Master 3',
        descricao: 'Mouse sem fio Logitech MX Master 3 com sensor Darkfield',
        preco: 399.90,
        precoCusto: 250.00,
        estoque: 50,
        estoqueMinimo: 10,
        categoria: 'Periféricos',
        codigoBarras: '7891234567891',
        sku: 'MS-LOGI-001',
        unidade: 'UN',
        marca: 'Logitech',
        modelo: 'MX Master 3',
        peso: 0.141,
        ativo: true
      },
      {
        nome: 'Teclado Mecânico Corsair K95',
        descricao: 'Teclado mecânico gaming Corsair K95 RGB Platinum',
        preco: 899.90,
        precoCusto: 600.00,
        estoque: 8,
        estoqueMinimo: 3,
        categoria: 'Periféricos',
        codigoBarras: '7891234567892',
        sku: 'KB-CORS-001',
        unidade: 'UN',
        marca: 'Corsair',
        modelo: 'K95 RGB Platinum',
        peso: 1.3,
        ativo: true
      },
      {
        nome: 'Monitor Samsung 24"',
        descricao: 'Monitor LED Samsung 24" Full HD, 75Hz',
        preco: 799.90,
        precoCusto: 500.00,
        estoque: 12,
        estoqueMinimo: 4,
        categoria: 'Monitores',
        codigoBarras: '7891234567893',
        sku: 'MON-SAMS-001',
        unidade: 'UN',
        marca: 'Samsung',
        modelo: '24" LED',
        peso: 4.2,
        ativo: true
      },
      {
        nome: 'Smartphone Samsung Galaxy A54',
        descricao: 'Smartphone Samsung Galaxy A54 5G, 128GB, Câmera Tripla',
        preco: 1899.90,
        precoCusto: 1400.00,
        estoque: 25,
        estoqueMinimo: 8,
        categoria: 'Smartphones',
        codigoBarras: '7891234567894',
        sku: 'CEL-SAMS-001',
        unidade: 'UN',
        marca: 'Samsung',
        modelo: 'Galaxy A54 5G',
        peso: 0.202,
        ativo: true
      }
    ];

    for (const produtoData of produtosExemplo) {
      const produtoExists = await produtoRepo.findOne({ where: { nome: produtoData.nome } });
      if (!produtoExists) {
        const produto = produtoRepo.create(produtoData);
        await produtoRepo.save(produto);
        console.log(`✅ Produto "${produtoData.nome}" criado`);
      }
    }

    // Criar clientes de exemplo
    const clientesExemplo = [
      {
        nome: 'Maria Silva',
        email: 'maria.silva@email.com',
        telefone: '(11) 99999-1111',
        endereco: 'Rua das Flores, 123',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        cpf_cnpj: '123.456.789-00',
        tipo: 'PF',
        ativo: true
      },
      {
        nome: 'João Santos Ltda',
        email: 'joao@empresa.com',
        telefone: '(11) 3333-4444',
        endereco: 'Av. Paulista, 1000',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        cpf_cnpj: '12.345.678/0001-90',
        inscricaoEstadual: '123.456.789.012',
        contato: 'João Santos',
        tipo: 'PJ',
        ativo: true
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@email.com',
        telefone: '(21) 98888-2222',
        endereco: 'Rua Copacabana, 456',
        numero: '456',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22000-000',
        cpf_cnpj: '987.654.321-00',
        tipo: 'PF',
        ativo: true
      },
      {
        nome: 'Tech Solutions S.A.',
        email: 'contato@techsolutions.com',
        telefone: '(11) 2222-3333',
        endereco: 'Rua Augusta, 2000',
        numero: '2000',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01305-100',
        cpf_cnpj: '98.765.432/0001-10',
        inscricaoEstadual: '987.654.321.098',
        contato: 'Carlos Tech',
        tipo: 'PJ',
        ativo: true
      }
    ];

    for (const clienteData of clientesExemplo) {
      const clienteExists = await clienteRepo.findOne({ where: { email: clienteData.email } });
      if (!clienteExists) {
        const cliente = clienteRepo.create(clienteData);
        await clienteRepo.save(cliente);
        console.log(`✅ Cliente "${clienteData.nome}" criado`);
      }
    }

    console.log('🎉 Seed executado com sucesso!');
    console.log('');
    console.log('📋 Dados criados:');
    console.log('👤 Usuários: admin@axora.com (senha: 123456)');
    console.log('👤 Vendedor: vendedor@axora.com (senha: 123456)');
    console.log('📦 5 produtos de exemplo');
    console.log('👥 4 clientes de exemplo');
    console.log('');
    console.log('🚀 Sistema pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await app.close();
  }
}

seed();

