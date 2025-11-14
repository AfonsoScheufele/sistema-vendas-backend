import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaEntity, MetaStatus, MetaTipo } from './meta.entity';
import { MetaProgressoEntity } from './meta-progresso.entity';
import { CreateMetaDto, AtualizarProgressoDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';

interface ListarMetasFiltro {
  status?: MetaStatus;
  tipo?: MetaTipo;
  search?: string;
}

@Injectable()
export class MetasService {
  constructor(
    @InjectRepository(MetaEntity)
    private readonly metaRepository: Repository<MetaEntity>,
    @InjectRepository(MetaProgressoEntity)
    private readonly progressoRepository: Repository<MetaProgressoEntity>,
  ) {}

  async listar(empresaId: string, filtro?: ListarMetasFiltro) {
    const query = this.metaRepository
      .createQueryBuilder('meta')
      .leftJoinAndSelect('meta.progresso', 'progresso')
      .where('meta.empresaId = :empresaId', { empresaId });

    if (filtro?.status) {
      query.andWhere('meta.status = :status', { status: filtro.status });
    }

    if (filtro?.tipo) {
      query.andWhere('meta.tipo = :tipo', { tipo: filtro.tipo });
    }

    if (filtro?.search) {
      const termo = `%${filtro.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(meta.titulo) LIKE :termo OR LOWER(meta.descricao) LIKE :termo OR LOWER(meta.responsavelNome) LIKE :termo)',
        { termo },
      );
    }

    const metas = await query.orderBy('meta.periodoFim', 'ASC').addOrderBy('meta.titulo', 'ASC').getMany();
    return metas.map((meta) => this.mapToResponse(meta));
  }

  async obterPorId(empresaId: string, id: string) {
    const meta = await this.metaRepository.findOne({
      where: { id, empresaId },
      relations: ['progresso'],
      order: {
        progresso: {
          criadoEm: 'DESC',
        },
      },
    });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }
    return this.mapToResponse(meta);
  }

  async criar(empresaId: string, dto: CreateMetaDto) {
    const meta = this.metaRepository.create({
      empresaId,
      titulo: dto.titulo,
      descricao: dto.descricao ?? null,
      tipo: dto.tipo,
      valorObjetivo: dto.valorObjetivo,
      valorAtual: dto.valorAtual ?? 0,
      progressoPercentual: this.calcularProgresso(dto.valorAtual ?? 0, dto.valorObjetivo),
      status: dto.status ?? 'ativa',
      periodoInicio: new Date(dto.periodoInicio),
      periodoFim: new Date(dto.periodoFim),
      responsavelId: dto.responsavelId ?? null,
      responsavelNome: dto.responsavelNome ?? null,
      tags: dto.tags ?? null,
    });

    const salvo = await this.metaRepository.save(meta);
    return this.obterPorId(empresaId, salvo.id);
  }

  async atualizar(empresaId: string, id: string, dto: UpdateMetaDto) {
    const meta = await this.metaRepository.findOne({ where: { id, empresaId } });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    if (dto.titulo !== undefined) meta.titulo = dto.titulo;
    if (dto.descricao !== undefined) meta.descricao = dto.descricao;
    if (dto.tipo !== undefined) meta.tipo = dto.tipo;
    if (dto.valorObjetivo !== undefined) meta.valorObjetivo = dto.valorObjetivo;
    if (dto.valorAtual !== undefined) meta.valorAtual = dto.valorAtual;
    if (dto.status !== undefined) meta.status = dto.status;
    if (dto.periodoInicio !== undefined) meta.periodoInicio = new Date(dto.periodoInicio);
    if (dto.periodoFim !== undefined) meta.periodoFim = new Date(dto.periodoFim);
    if (dto.responsavelId !== undefined) meta.responsavelId = dto.responsavelId;
    if (dto.responsavelNome !== undefined) meta.responsavelNome = dto.responsavelNome;
    if (dto.tags !== undefined) meta.tags = dto.tags;

    meta.progressoPercentual = this.calcularProgresso(meta.valorAtual, meta.valorObjetivo);

    await this.metaRepository.save(meta);
    return this.obterPorId(empresaId, id);
  }

  async remover(empresaId: string, id: string) {
    const meta = await this.metaRepository.findOne({ where: { id, empresaId } });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }
    await this.metaRepository.remove(meta);
  }

  async registrarProgresso(empresaId: string, id: string, dto: AtualizarProgressoDto) {
    const meta = await this.metaRepository.findOne({ where: { id, empresaId } });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    const progressoPercentual =
      dto.progressoPercentual ?? this.calcularProgresso(dto.valorAtual, meta.valorObjetivo);

    const registro = this.progressoRepository.create({
      empresaId,
      metaId: meta.id,
      valorAtual: dto.valorAtual,
      progressoPercentual,
      observacao: dto.observacao ?? null,
    });

    await this.progressoRepository.save(registro);

    meta.valorAtual = dto.valorAtual;
    meta.progressoPercentual = progressoPercentual;
    if (meta.progressoPercentual >= 100 && meta.status !== 'atingida') {
      meta.status = 'atingida';
    } else if (meta.progressoPercentual < 100 && meta.status === 'atingida') {
      meta.status = 'ativa';
    }

    await this.metaRepository.save(meta);
    return this.obterPorId(empresaId, id);
  }

  async listarProgresso(empresaId: string, id: string) {
    await this.ensureMeta(empresaId, id);
    const registros = await this.progressoRepository.find({
      where: { empresaId, metaId: id },
      order: { criadoEm: 'DESC' },
    });
    return registros.map((registro) => ({
      id: registro.id,
      valorAtual: Number(registro.valorAtual ?? 0),
      progressoPercentual: registro.progressoPercentual,
      observacao: registro.observacao,
      criadoEm: registro.criadoEm,
    }));
  }

  async obterEstatisticas(empresaId: string) {
    const metas = await this.metaRepository.find({ where: { empresaId } });
    if (!metas.length) {
      return {
        totalMetas: 0,
        metasAtivas: 0,
        metasAtingidas: 0,
        metasAtrasadas: 0,
        progressoMedio: 0,
        valorObjetivoTotal: 0,
      };
    }

    const totalMetas = metas.length;
    const metasAtivas = metas.filter((meta) => meta.status === 'ativa').length;
    const metasAtingidas = metas.filter((meta) => meta.status === 'atingida').length;
    const metasAtrasadas = metas.filter((meta) => meta.status === 'atrasada').length;
    const progressoMedio =
      metas.reduce((acc, meta) => acc + meta.progressoPercentual, 0) / Math.max(totalMetas, 1);
    const valorObjetivoTotal = metas.reduce((acc, meta) => acc + Number(meta.valorObjetivo ?? 0), 0);

    return {
      totalMetas,
      metasAtivas,
      metasAtingidas,
      metasAtrasadas,
      progressoMedio: Number(progressoMedio.toFixed(1)),
      valorObjetivoTotal: Number(valorObjetivoTotal.toFixed(2)),
    };
  }

  private calcularProgresso(valorAtual: number, valorObjetivo: number) {
    if (!valorObjetivo || valorObjetivo <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((valorAtual / valorObjetivo) * 100));
  }

  private async ensureMeta(empresaId: string, id: string) {
    const meta = await this.metaRepository.findOne({ where: { id, empresaId } });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }
    return meta;
  }

  private mapToResponse(meta: MetaEntity) {
    return {
      id: meta.id,
      titulo: meta.titulo,
      descricao: meta.descricao,
      tipo: meta.tipo,
      status: meta.status,
      valorObjetivo: Number(meta.valorObjetivo ?? 0),
      valorAtual: Number(meta.valorAtual ?? 0),
      progressoPercentual: meta.progressoPercentual,
      periodoInicio: meta.periodoInicio,
      periodoFim: meta.periodoFim,
      responsavelId: meta.responsavelId,
      responsavelNome: meta.responsavelNome,
      tags: meta.tags ?? [],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      progresso: (meta.progresso ?? [])
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
        .map((registro) => ({
          id: registro.id,
          valorAtual: Number(registro.valorAtual ?? 0),
          progressoPercentual: registro.progressoPercentual,
          observacao: registro.observacao,
          criadoEm: registro.criadoEm,
        })),
    };
  }
}


