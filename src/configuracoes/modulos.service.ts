import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ModuloEntity, ModuloCategoria } from './modulo.entity';
import { ModuloEmpresaEntity } from './modulo-empresa.entity';

@Injectable()
export class ModulosService {
  constructor(
    @InjectRepository(ModuloEntity)
    private readonly moduloRepository: Repository<ModuloEntity>,
    @InjectRepository(ModuloEmpresaEntity)
    private readonly moduloEmpresaRepository: Repository<ModuloEmpresaEntity>,
  ) {}

  async listarModulosDisponiveis(): Promise<ModuloEntity[]> {
    return this.moduloRepository.find({
      where: { ativo: true },
      order: { ordem: 'ASC', nome: 'ASC' },
    });
  }

  async listarModulosPorCategoria(categoria: ModuloCategoria): Promise<ModuloEntity[]> {
    return this.moduloRepository.find({
      where: { ativo: true, categoria },
      order: { ordem: 'ASC', nome: 'ASC' },
    });
  }

  async obterModulosHabilitados(empresaId: string): Promise<ModuloEmpresaEntity[]> {
    const modulos = await this.moduloEmpresaRepository.find({
      where: { empresaId, habilitado: true },
      relations: ['modulo'],
    });
    return modulos.sort((a, b) => {
      const ordemA = a.modulo?.ordem || 0;
      const ordemB = b.modulo?.ordem || 0;
      if (ordemA !== ordemB) return ordemA - ordemB;
      return (a.modulo?.nome || '').localeCompare(b.modulo?.nome || '');
    });
  }

  async obterCodigosModulosHabilitados(empresaId: string): Promise<string[]> {
    const modulosHabilitados = await this.moduloEmpresaRepository.find({
      where: { empresaId, habilitado: true },
      relations: ['modulo'],
    });
    return modulosHabilitados.map((m) => m.modulo.codigo);
  }

  async verificarModuloHabilitado(empresaId: string, codigoModulo: string): Promise<boolean> {
    const modulo = await this.moduloRepository.findOne({ where: { codigo: codigoModulo } });
    if (!modulo) return false;

    const moduloEmpresa = await this.moduloEmpresaRepository.findOne({
      where: { empresaId, moduloId: modulo.id },
    });

    if (!moduloEmpresa) {
      return modulo.habilitadoPorPadrao;
    }

    return moduloEmpresa.habilitado;
  }

  async habilitarModulo(empresaId: string, codigoModulo: string, configuracoes?: Record<string, any>): Promise<ModuloEmpresaEntity> {
    const modulo = await this.moduloRepository.findOne({ where: { codigo: codigoModulo } });
    if (!modulo) {
      throw new NotFoundException(`Módulo ${codigoModulo} não encontrado`);
    }

    let moduloEmpresa = await this.moduloEmpresaRepository.findOne({
      where: { empresaId, moduloId: modulo.id },
    });

    if (!moduloEmpresa) {
      moduloEmpresa = this.moduloEmpresaRepository.create({
        empresaId,
        moduloId: modulo.id,
        habilitado: true,
        configuracoes: configuracoes || {},
      });
    } else {
      moduloEmpresa.habilitado = true;
      if (configuracoes) {
        moduloEmpresa.configuracoes = { ...moduloEmpresa.configuracoes, ...configuracoes };
      }
    }

    return this.moduloEmpresaRepository.save(moduloEmpresa);
  }

  async desabilitarModulo(empresaId: string, codigoModulo: string): Promise<void> {
    const modulo = await this.moduloRepository.findOne({ where: { codigo: codigoModulo } });
    if (!modulo) {
      throw new NotFoundException(`Módulo ${codigoModulo} não encontrado`);
    }

    const moduloEmpresa = await this.moduloEmpresaRepository.findOne({
      where: { empresaId, moduloId: modulo.id },
    });

    if (moduloEmpresa) {
      moduloEmpresa.habilitado = false;
      await this.moduloEmpresaRepository.save(moduloEmpresa);
    }
  }

  async atualizarConfiguracaoModulo(
    empresaId: string,
    codigoModulo: string,
    configuracoes: Record<string, any>,
  ): Promise<ModuloEmpresaEntity> {
    const modulo = await this.moduloRepository.findOne({ where: { codigo: codigoModulo } });
    if (!modulo) {
      throw new NotFoundException(`Módulo ${codigoModulo} não encontrado`);
    }

    let moduloEmpresa = await this.moduloEmpresaRepository.findOne({
      where: { empresaId, moduloId: modulo.id },
    });

    if (!moduloEmpresa) {
      moduloEmpresa = this.moduloEmpresaRepository.create({
        empresaId,
        moduloId: modulo.id,
        habilitado: true,
        configuracoes,
      });
    } else {
      moduloEmpresa.configuracoes = { ...moduloEmpresa.configuracoes, ...configuracoes };
    }

    return this.moduloEmpresaRepository.save(moduloEmpresa);
  }

  async habilitarModulosPadrao(empresaId: string): Promise<void> {
    const modulosPadrao = await this.moduloRepository.find({
      where: { habilitadoPorPadrao: true, ativo: true },
    });

    for (const modulo of modulosPadrao) {
      const existe = await this.moduloEmpresaRepository.findOne({
        where: { empresaId, moduloId: modulo.id },
      });

      if (!existe) {
        await this.moduloEmpresaRepository.save(
          this.moduloEmpresaRepository.create({
            empresaId,
            moduloId: modulo.id,
            habilitado: true,
            configuracoes: {},
          }),
        );
      }
    }
  }

  async obterConfiguracaoModulo(empresaId: string, codigoModulo: string): Promise<Record<string, any> | null> {
    const modulo = await this.moduloRepository.findOne({ where: { codigo: codigoModulo } });
    if (!modulo) return null;

    const moduloEmpresa = await this.moduloEmpresaRepository.findOne({
      where: { empresaId, moduloId: modulo.id },
      relations: ['modulo'],
    });

    if (!moduloEmpresa) {
      return modulo.configuracoes || {};
    }

    return {
      ...(modulo.configuracoes || {}),
      ...(moduloEmpresa.configuracoes || {}),
    };
  }
}

