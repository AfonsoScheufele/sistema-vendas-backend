import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEmpresaEntity } from './usuario-empresa.entity';
import { Usuario } from '../auth/usuario.entity';
import { EmpresaEntity } from './empresa.entity';

export interface VincularUsuarioEmpresaDto {
  usuarioId: number;
  empresaId: string;
  papel?: string;
  permissoes?: string[];
  ativo?: boolean;
}

@Injectable()
export class UsuarioEmpresaService {
  constructor(
    @InjectRepository(UsuarioEmpresaEntity)
    private readonly usuarioEmpresaRepo: Repository<UsuarioEmpresaEntity>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepo: Repository<EmpresaEntity>,
  ) {}

  async vincularUsuarioEmpresa(dto: VincularUsuarioEmpresaDto): Promise<UsuarioEmpresaEntity> {
    // Verificar se usuário existe
    const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se empresa existe
    const empresa = await this.empresaRepo.findOne({ where: { id: dto.empresaId } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se já existe vínculo
    const vinculoExistente = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId: dto.usuarioId, empresaId: dto.empresaId },
    });

    if (vinculoExistente) {
      // Atualizar vínculo existente
      vinculoExistente.papel = dto.papel || vinculoExistente.papel;
      vinculoExistente.permissoes = dto.permissoes || vinculoExistente.permissoes;
      vinculoExistente.ativo = dto.ativo ?? vinculoExistente.ativo;
      return await this.usuarioEmpresaRepo.save(vinculoExistente);
    }

    // Criar novo vínculo
    const vinculo = this.usuarioEmpresaRepo.create({
      usuarioId: dto.usuarioId,
      empresaId: dto.empresaId,
      papel: dto.papel || 'viewer',
      permissoes: dto.permissoes || [],
      ativo: dto.ativo ?? true,
    });

    return await this.usuarioEmpresaRepo.save(vinculo);
  }

  async desvincularUsuarioEmpresa(usuarioId: number, empresaId: string): Promise<void> {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    await this.usuarioEmpresaRepo.remove(vinculo);
  }

  async listarEmpresasDoUsuario(usuarioId: number): Promise<EmpresaEntity[]> {
    const vinculos = await this.usuarioEmpresaRepo.find({
      where: { usuarioId, ativo: true },
      relations: ['empresa'],
    });

    return vinculos.map((v) => v.empresa);
  }

  async listarUsuariosDaEmpresa(empresaId: string): Promise<Usuario[]> {
    const vinculos = await this.usuarioEmpresaRepo.find({
      where: { empresaId, ativo: true },
      relations: ['usuario'],
    });

    return vinculos.map((v) => v.usuario);
  }

  async obterVinculo(usuarioId: number, empresaId: string): Promise<UsuarioEmpresaEntity | null> {
    return await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
      relations: ['usuario', 'empresa'],
    });
  }

  async atualizarPermissoes(
    usuarioId: number,
    empresaId: string,
    permissoes: string[],
  ): Promise<UsuarioEmpresaEntity> {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    vinculo.permissoes = permissoes;
    return await this.usuarioEmpresaRepo.save(vinculo);
  }

  async atualizarPapel(
    usuarioId: number,
    empresaId: string,
    papel: string,
  ): Promise<UsuarioEmpresaEntity> {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    vinculo.papel = papel;
    return await this.usuarioEmpresaRepo.save(vinculo);
  }

  async verificarAcesso(usuarioId: number, empresaId: string): Promise<boolean> {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId, ativo: true },
    });

    return !!vinculo;
  }

  async obterPermissoes(usuarioId: number, empresaId: string): Promise<string[]> {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId, ativo: true },
    });

    if (!vinculo) {
      return [];
    }

    return vinculo.permissoes || [];
  }
}

