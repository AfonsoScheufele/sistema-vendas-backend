import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';

@Injectable()
export class VendedoresService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioEmpresaEntity)
    private usuarioEmpresaRepository: Repository<UsuarioEmpresaEntity>,
  ) {}

  async listar(empresaId: string) {
    const usuariosEmpresa = await this.usuarioEmpresaRepository.find({
      where: { 
        empresaId,
        ativo: true, 
      },
      relations: ['usuario'],
    });

    const vendedores = usuariosEmpresa
      .filter((ue) => ue.usuario && ue.usuario.ativo)
      .map((ue) => {
        const usuario = ue.usuario;
        return {
          id: usuario.id,
          nome: usuario.name,
          email: usuario.email || '',
          telefone: undefined, 
          empresaId: empresaId,
          ativo: usuario.ativo,
        };
      });

    return vendedores;
  }
}
