import { DataSource } from 'typeorm';
import { EmpresaEntity } from '../src/empresas/empresa.entity';
import * as dns from 'dns';
import * as fs from 'fs';
import * as path from 'path';

dns.setDefaultResultOrder('ipv4first');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIndex = trimmed.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim();
          let value = trimmed.substring(equalIndex + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

async function seedEmpresaAxora() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const username = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'postgres';
  const useSsl = process.env.DB_SSL === 'true';

  let resolvedHost = host;
  try {
    const addresses = await dns.promises.resolve4(host || 'localhost');
    if (addresses.length > 0) {
      resolvedHost = addresses[0];
    }
  } catch (error) {
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: resolvedHost,
    port: port || 5432,
    username: username || 'postgres',
    password: password,
    database: database || 'postgres',
    entities: [EmpresaEntity],
    synchronize: false,
    logging: true,
    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const empresaRepo = dataSource.getRepository(EmpresaEntity);

    const empresaAxora = {
      nome: 'Axora',
      cnpj: '12345678000190',
      razaoSocial: 'Axora Tecnologia e Soluções Ltda',
      email: 'contato@axora.com.br',
      telefone: '(11) 3456-7890',
      endereco: 'Rua das Empresas',
      numero: '123',
      complemento: 'Sala 100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      inscricaoEstadual: '123456789012',
      inscricaoMunicipal: '987654321',
      observacoes: 'Empresa padrão do sistema para testes',
      ativo: true,
    };

    const existingByCnpj = await empresaRepo.findOne({
      where: { cnpj: empresaAxora.cnpj },
    });

    const existingByName = await empresaRepo.findOne({
      where: { nome: empresaAxora.nome },
    });

    if (existingByCnpj || existingByName) {
      console.log(`⚠️  Empresa "${empresaAxora.nome}" já existe no banco de dados.`);
      console.log(`   ID: ${existingByCnpj?.id || existingByName?.id}`);
      console.log(`   Nome: ${existingByCnpj?.nome || existingByName?.nome}`);
    } else {
      const empresa = empresaRepo.create(empresaAxora);
      const saved = await empresaRepo.save(empresa);
      console.log(`✅ Empresa "${empresaAxora.nome}" criada com sucesso!`);
      console.log(`   ID: ${saved.id}`);
      console.log(`   Nome: ${saved.nome}`);
      console.log(`   CNPJ: ${saved.cnpj}`);
    }

    await dataSource.destroy();
    console.log('✅ Conexão fechada');
  } catch (error) {
    console.error('❌ Erro ao criar empresa:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seedEmpresaAxora();

