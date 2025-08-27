import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Venda } from '../vendas/venda.entity';
import { ItemVenda } from '../vendas/item-venda.entity';
import { Usuario } from '../auth/usuario.entity';

console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD?.toString(),
  database: process.env.DB_NAME,
  entities: [Produto, Cliente, Venda, ItemVenda, Usuario],
  synchronize: true,
  logging: true,
};
