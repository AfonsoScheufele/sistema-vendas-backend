import { Injectable } from '@nestjs/common';

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  empresaId: string;
  ativo: boolean;
}

const VENDEDORES_POR_EMPRESA: Record<string, Vendedor[]> = {
  'empresa-sul': [
    {
      id: 21,
      nome: 'Mariana Souza',
      email: 'mariana.souza@axora.com',
      telefone: '(51) 99888-1122',
      empresaId: 'empresa-sul',
      ativo: true,
    },
    {
      id: 22,
      nome: 'Rafael Oliveira',
      email: 'rafael.oliveira@axora.com',
      telefone: '(51) 99777-3344',
      empresaId: 'empresa-sul',
      ativo: true,
    },
  ],
  default: [
    {
      id: 11,
      nome: 'Ana Pereira',
      email: 'ana.pereira@axora.com',
      telefone: '(11) 99999-1111',
      empresaId: 'default-empresa',
      ativo: true,
    },
    {
      id: 12,
      nome: 'Bruno Costa',
      email: 'bruno.costa@axora.com',
      telefone: '(11) 98888-2222',
      empresaId: 'default-empresa',
      ativo: true,
    },
    {
      id: 13,
      nome: 'Carla Mendes',
      email: 'carla.mendes@axora.com',
      telefone: '(11) 97777-3333',
      empresaId: 'default-empresa',
      ativo: true,
    },
  ],
};

@Injectable()
export class VendedoresService {
  async listar(empresaId: string) {
    const chave = VENDEDORES_POR_EMPRESA[empresaId] ? empresaId : 'default';
    return VENDEDORES_POR_EMPRESA[chave].map((vendedor) => ({
      id: vendedor.id,
      nome: vendedor.nome,
      email: vendedor.email,
      telefone: vendedor.telefone,
      empresaId: vendedor.empresaId,
      ativo: vendedor.ativo,
    }));
  }
}