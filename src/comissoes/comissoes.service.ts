import { Injectable } from '@nestjs/common';

@Injectable()
export class ComissoesService {
  async listar() {
    // Retornar dados mockados por enquanto
    return {
      data: [],
      message: 'Comissões carregadas com sucesso'
    };
  }
}

