import { Injectable } from '@nestjs/common';

@Injectable()
export class EmpresasService {
  listarEmpresas() {
    return [
      {
        id: 'default-empresa',
        nome: 'Axora Matriz',
        cnpj: '12.345.678/0001-90',
        papel: 'admin',
      },
      {
        id: 'empresa-sul',
        nome: 'Axora Regional Sul',
        cnpj: '98.765.432/0001-10',
        papel: 'viewer',
      },
    ];
  }
}

