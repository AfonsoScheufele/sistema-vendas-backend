import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { MetaEntity, MetaStatus, MetaTipo } from './meta.entity';
import { MetaProgressoEntity } from './meta-progresso.entity';
import { CreateMetaDto, AtualizarProgressoDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { GrupoVendedores } from './grupo-vendedores.entity';
import { GrupoVendedorUsuario } from './grupo-vendedor-usuario.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { NotificationsService } from '../notifications/notifications.service';

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
    @InjectRepository(GrupoVendedores)
    private readonly grupoVendedoresRepository: Repository<GrupoVendedores>,
    @InjectRepository(GrupoVendedorUsuario)
    private readonly grupoVendedorUsuarioRepository: Repository<GrupoVendedorUsuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listar(empresaId: string, filtro?: ListarMetasFiltro) {
    const query = this.metaRepository
      .createQueryBuilder('meta')
      .leftJoinAndSelect('meta.progresso', 'progresso')
      .leftJoinAndSelect('meta.grupoVendedores', 'grupoVendedores')
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
    
    for (const meta of metas) {
      if (meta.grupoVendedoresId) {
        await this.atualizarProgressoAutomatico(meta);
      }
    }
    
    return metas.map((meta) => this.mapToResponse(meta));
  }

  async obterPorId(empresaId: string, id: string) {
    const meta = await this.metaRepository.findOne({
      where: { id, empresaId },
      relations: ['progresso', 'grupoVendedores'],
      order: {
        progresso: {
          criadoEm: 'DESC',
        },
      },
    });
    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }
    
    if (meta.grupoVendedoresId) {
      await this.atualizarProgressoAutomatico(meta);
    }
    
    return this.mapToResponse(meta);
  }

  async criar(empresaId: string, dto: CreateMetaDto) {
    let valorInicial = dto.valorAtual ?? 0;
    
    if (dto.grupoVendedoresId) {
      valorInicial = await this.calcularVendasDoGrupo(
        empresaId,
        dto.grupoVendedoresId,
        new Date(dto.periodoInicio),
        new Date(dto.periodoFim),
        dto.tipo,
      );
    }
    
    const meta = this.metaRepository.create({
      empresaId,
      titulo: dto.titulo,
      descricao: dto.descricao ?? null,
      tipo: dto.tipo,
      valorObjetivo: dto.valorObjetivo,
      valorAtual: valorInicial,
      progressoPercentual: this.calcularProgresso(valorInicial, dto.valorObjetivo),
      status: dto.status ?? 'ativa',
      periodoInicio: new Date(dto.periodoInicio),
      periodoFim: new Date(dto.periodoFim),
      responsavelId: dto.responsavelId ?? null,
      responsavelNome: dto.responsavelNome ?? null,
      tags: dto.tags ?? null,
      grupoVendedoresId: dto.grupoVendedoresId ?? null,
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
    if (dto.grupoVendedoresId !== undefined) meta.grupoVendedoresId = dto.grupoVendedoresId;

    if (meta.grupoVendedoresId) {
      await this.atualizarProgressoAutomatico(meta);
      await this.verificarENotificarGerente(meta);
    } else {
      meta.progressoPercentual = this.calcularProgresso(meta.valorAtual, meta.valorObjetivo);
    }

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

  private async atualizarProgressoAutomatico(meta: MetaEntity) {
    if (!meta.grupoVendedoresId) return;

    const progressoAnterior = meta.progressoPercentual;
    const statusAnterior = meta.status;

    const valorAtual = await this.calcularVendasDoGrupo(
      meta.empresaId,
      meta.grupoVendedoresId,
      meta.periodoInicio,
      meta.periodoFim,
      meta.tipo,
    );

    meta.valorAtual = valorAtual;
    meta.progressoPercentual = this.calcularProgresso(valorAtual, meta.valorObjetivo);

    if (meta.progressoPercentual >= 100 && meta.status !== 'atingida') {
      meta.status = 'atingida';
    } else if (meta.progressoPercentual < 100 && meta.status === 'atingida') {
      meta.status = 'ativa';
    }

    await this.metaRepository.save(meta);

    if (
      meta.status === 'atingida' ||
      (meta.progressoPercentual >= 100 && statusAnterior !== 'atingida') ||
      Math.abs(meta.progressoPercentual - progressoAnterior) >= 10
    ) {
      await this.verificarENotificarGerente(meta);
    }
  }

  private async calcularVendasDoGrupo(
    empresaId: string,
    grupoId: number,
    periodoInicio: Date,
    periodoFim: Date,
    tipoMeta: MetaTipo,
  ): Promise<number> {
    const grupo = await this.grupoVendedoresRepository.findOne({
      where: { id: grupoId, empresaId },
      relations: ['vendedores', 'vendedores.usuario'],
    });

    if (!grupo || !grupo.vendedores || grupo.vendedores.length === 0) {
      return 0;
    }

    const vendedorIds = grupo.vendedores.map((gvu) => gvu.usuarioId);

    if (vendedorIds.length === 0) {
      return 0;
    }

    const whereConditions: any = {
      empresaId,
      vendedorId: vendedorIds.length === 1 ? vendedorIds[0] : In(vendedorIds),
      dataPedido: Between(periodoInicio, periodoFim),
    };

    if (tipoMeta === 'faturamento') {
      whereConditions.status = 'entregue';
    }

    const pedidos = await this.pedidoRepository.find({
      where: whereConditions,
    });

    switch (tipoMeta) {
      case 'faturamento':
        return pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);

      case 'vendas':
        return pedidos.filter((p) => 
          ['entregue', 'enviado', 'processando'].includes(p.status)
        ).length;

      case 'novos_clientes':
        const clientesUnicos = new Set(
          pedidos.map((p) => p.clienteId).filter((id) => id != null)
        );
        return clientesUnicos.size;

      case 'tickets_medio':
        const pedidosComValor = pedidos.filter((p) => Number(p.total || 0) > 0);
        if (pedidosComValor.length === 0) return 0;
        const soma = pedidosComValor.reduce((acc, p) => acc + Number(p.total || 0), 0);
        return soma / pedidosComValor.length;

      default:
        return 0;
    }
  }

  private async verificarENotificarGerente(meta: MetaEntity) {
    if (!meta.grupoVendedoresId) return;

    try {
      const grupo = await this.grupoVendedoresRepository.findOne({
        where: { id: meta.grupoVendedoresId },
        relations: ['gerente'],
      });

      if (!grupo || !grupo.gerenteId) return;

      const progresso = meta.progressoPercentual;
      const hoje = new Date();
      const diasRestantes = Math.ceil(
        (new Date(meta.periodoFim).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
      );
      const percentualTempo = Math.max(
        0,
        Math.min(
          100,
          ((hoje.getTime() - new Date(meta.periodoInicio).getTime()) /
            (new Date(meta.periodoFim).getTime() - new Date(meta.periodoInicio).getTime())) *
            100,
        ),
      );

      if (progresso >= 100 && meta.status === 'atingida') {
        await this.notificationsService.criarNotificacao(
          grupo.gerenteId,
          `🎉 Meta Atingida: ${meta.titulo}`,
          `A meta "${meta.titulo}" do grupo ${grupo.nome} foi atingida! Progresso: ${progresso}%`,
          'success',
          'high',
        );
      }
      else if (progresso < 50 && percentualTempo > 50 && meta.status === 'ativa') {
        await this.notificationsService.criarNotificacao(
          grupo.gerenteId,
          `⚠️ Meta em Risco: ${meta.titulo}`,
          `A meta "${meta.titulo}" do grupo ${grupo.nome} está em ${progresso}% com apenas ${diasRestantes} dias restantes. Ação necessária!`,
          'warning',
          'high',
        );
      }
      else if (progresso >= 90 && progresso < 100 && meta.status === 'ativa') {
        await this.notificationsService.criarNotificacao(
          grupo.gerenteId,
          `📈 Meta Quase Atingida: ${meta.titulo}`,
          `A meta "${meta.titulo}" do grupo ${grupo.nome} está em ${progresso}%! Faltam apenas ${(Number(meta.valorObjetivo) - Number(meta.valorAtual)).toFixed(2)} para atingir o objetivo.`,
          'info',
          'normal',
        );
      }
    } catch (error) {
      console.error('Erro ao verificar e notificar gerente:', error);
    }
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
      grupoVendedoresId: meta.grupoVendedoresId,
      grupoVendedores: meta.grupoVendedores
        ? {
            id: meta.grupoVendedores.id,
            nome: meta.grupoVendedores.nome,
          }
        : null,
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


