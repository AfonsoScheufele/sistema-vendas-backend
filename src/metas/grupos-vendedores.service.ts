import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { GrupoVendedores } from './grupo-vendedores.entity';
import { GrupoVendedorUsuario } from './grupo-vendedor-usuario.entity';
import { Usuario } from '../auth/usuario.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { MetaEntity } from './meta.entity';

export interface CreateGrupoVendedoresDto {
  nome: string;
  descricao?: string;
  vendedorIds?: number[];
  gerenteId: number;
}

export interface UpdateGrupoVendedoresDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  vendedorIds?: number[];
  gerenteId?: number;
}

@Injectable()
export class GruposVendedoresService {
  constructor(
    @InjectRepository(GrupoVendedores)
    private readonly grupoRepository: Repository<GrupoVendedores>,
    @InjectRepository(GrupoVendedorUsuario)
    private readonly grupoVendedorUsuarioRepository: Repository<GrupoVendedorUsuario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(MetaEntity)
    private readonly metaRepository: Repository<MetaEntity>,
  ) {}

  async listar(empresaId: string) {
    const grupos = await this.grupoRepository.find({
      where: { empresaId },
      relations: ['vendedores', 'vendedores.usuario', 'gerente'],
      order: { nome: 'ASC' },
    });

    return grupos.map((grupo) => this.mapToResponse(grupo));
  }

  async obterPorId(empresaId: string, id: number) {
    const grupo = await this.grupoRepository.findOne({
      where: { id, empresaId },
      relations: ['vendedores', 'vendedores.usuario', 'gerente'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo de vendedores não encontrado');
    }

    return this.mapToResponse(grupo);
  }

  async criar(empresaId: string, dto: CreateGrupoVendedoresDto) {
    const grupoExistente = await this.grupoRepository.findOne({
      where: { empresaId, nome: dto.nome },
    });

    if (grupoExistente) {
      throw new ConflictException('Já existe um grupo com este nome nesta empresa');
    }

    if (!dto.gerenteId) {
      throw new BadRequestException('É obrigatório selecionar um gerente para o grupo');
    }

    const gerente = await this.usuarioRepository.findOne({
      where: { id: dto.gerenteId, ativo: true },
    });
    if (!gerente) {
      throw new NotFoundException('Gerente não encontrado ou inativo');
    }

    const grupo = this.grupoRepository.create({
      nome: dto.nome,
      descricao: dto.descricao || null,
      empresaId,
      ativo: true,
      gerenteId: dto.gerenteId,
    });

    const grupoSalvo = await this.grupoRepository.save(grupo);

    if (dto.vendedorIds && dto.vendedorIds.length > 0) {
      await this.adicionarVendedores(grupoSalvo.id, dto.vendedorIds);
    }

    return this.obterPorId(empresaId, grupoSalvo.id);
  }

  async atualizar(empresaId: string, id: number, dto: UpdateGrupoVendedoresDto) {
    const grupo = await this.grupoRepository.findOne({
      where: { id, empresaId },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo de vendedores não encontrado');
    }

    if (dto.nome && dto.nome !== grupo.nome) {
      const grupoExistente = await this.grupoRepository.findOne({
        where: { empresaId, nome: dto.nome },
      });

      if (grupoExistente) {
        throw new ConflictException('Já existe um grupo com este nome nesta empresa');
      }
    }

    if (dto.gerenteId !== undefined) {
      if (dto.gerenteId) {
        const gerente = await this.usuarioRepository.findOne({
          where: { id: dto.gerenteId, ativo: true },
        });
        if (!gerente) {
          throw new NotFoundException('Gerente não encontrado ou inativo');
        }
      }
      grupo.gerenteId = dto.gerenteId || null;
    }

    if (dto.nome !== undefined) grupo.nome = dto.nome;
    if (dto.descricao !== undefined) grupo.descricao = dto.descricao;
    if (dto.ativo !== undefined) grupo.ativo = dto.ativo;

    await this.grupoRepository.save(grupo);

    if (dto.vendedorIds !== undefined) {
      await this.grupoVendedorUsuarioRepository.delete({ grupoId: id });
      if (dto.vendedorIds.length > 0) {
        await this.adicionarVendedores(id, dto.vendedorIds);
      }
    }

    return this.obterPorId(empresaId, id);
  }

  async remover(empresaId: string, id: number) {
    const grupo = await this.grupoRepository.findOne({
      where: { id, empresaId },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo de vendedores não encontrado');
    }

    await this.grupoRepository.remove(grupo);
  }

  async adicionarVendedores(grupoId: number, vendedorIds: number[]) {
    const usuarios = await this.usuarioRepository.find({
      where: vendedorIds.map((id) => ({ id, ativo: true })),
    });

    if (usuarios.length !== vendedorIds.length) {
      throw new NotFoundException('Um ou mais vendedores não foram encontrados ou estão inativos');
    }

    const vinculos = vendedorIds.map((usuarioId) =>
      this.grupoVendedorUsuarioRepository.create({
        grupoId,
        usuarioId,
      }),
    );

    await this.grupoVendedorUsuarioRepository.save(vinculos);
  }

  async removerVendedor(grupoId: number, usuarioId: number) {
    await this.grupoVendedorUsuarioRepository.delete({ grupoId, usuarioId });
  }

  async obterEstatisticas(
    empresaId: string,
    id: number,
    usuarioId: number,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const grupo = await this.grupoRepository.findOne({
      where: { id, empresaId },
      relations: ['vendedores', 'vendedores.usuario', 'gerente', 'metas'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo de vendedores não encontrado');
    }

    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (usuario.role !== 'Admin' && grupo.gerenteId !== usuarioId) {
      throw new ConflictException('Acesso negado. Apenas o gerente do grupo pode visualizar estas estatísticas.');
    }

    const vendedorIds = grupo.vendedores.map((gvu) => gvu.usuarioId);
    
    let inicioPeriodo: Date;
    let fimPeriodo: Date;
    
    if (dataInicio && dataFim) {
      inicioPeriodo = new Date(dataInicio);
      fimPeriodo = new Date(dataFim);
      fimPeriodo.setHours(23, 59, 59, 999);
    } else {
      const hoje = new Date();
      inicioPeriodo = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fimPeriodo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    }

    const pedidosMes = await this.pedidoRepository.find({
      where: {
        empresaId,
        vendedorId: In(vendedorIds),
        dataPedido: Between(inicioPeriodo, fimPeriodo),
      },
    });

    const pedidosEntregues = pedidosMes.filter((p) => p.status === 'entregue');
    const totalFaturamento = pedidosEntregues.reduce((sum, p) => sum + Number(p.total), 0);
    const ticketMedio = pedidosEntregues.length > 0 ? totalFaturamento / pedidosEntregues.length : 0;

    const statsPorVendedor = await Promise.all(
      grupo.vendedores.map(async (gvu) => {
        const pedidosVendedor = pedidosMes.filter((p) => p.vendedorId === gvu.usuarioId);
        const pedidosEntreguesVendedor = pedidosVendedor.filter((p) => p.status === 'entregue');
        const faturamentoVendedor = pedidosEntreguesVendedor.reduce(
          (sum, p) => sum + Number(p.total),
          0,
        );

        const metasVendedor = await this.metaRepository.find({
          where: {
            empresaId,
            responsavelId: gvu.usuarioId,
            status: In(['ativa', 'atingida']),
          },
        });

        const metasComProgresso = metasVendedor.map((meta) => {
          const pedidosMeta = pedidosMes.filter(
            (p) =>
              p.vendedorId === gvu.usuarioId &&
              p.dataPedido >= meta.periodoInicio &&
              p.dataPedido <= meta.periodoFim &&
              (meta.tipo === 'faturamento' ? p.status === 'entregue' : true),
          );

          let valorAtual = 0;
          if (meta.tipo === 'faturamento') {
            valorAtual = pedidosMeta
              .filter((p) => p.status === 'entregue')
              .reduce((sum, p) => sum + Number(p.total), 0);
          } else if (meta.tipo === 'vendas') {
            valorAtual = pedidosMeta.filter((p) =>
              ['entregue', 'enviado', 'processando'].includes(p.status),
            ).length;
          }

          const progresso = meta.valorObjetivo > 0 
            ? Math.min(100, Math.round((valorAtual / Number(meta.valorObjetivo)) * 100))
            : 0;

          return {
            id: meta.id,
            titulo: meta.titulo,
            tipo: meta.tipo,
            valorObjetivo: Number(meta.valorObjetivo),
            valorAtual,
            progressoPercentual: progresso,
            status: progresso >= 100 ? 'atingida' : meta.status,
          };
        });

        return {
          vendedorId: gvu.usuarioId,
          vendedorNome: gvu.usuario.name,
          vendedorEmail: gvu.usuario.email || '',
          totalPedidos: pedidosVendedor.length,
          pedidosEntregues: pedidosEntreguesVendedor.length,
          faturamento: faturamentoVendedor,
          ticketMedio: pedidosEntreguesVendedor.length > 0 ? faturamentoVendedor / pedidosEntreguesVendedor.length : 0,
          metas: metasComProgresso,
        };
      }),
    );

    const metasAtivas = grupo.metas?.filter((m) => m.status === 'ativa') || [];
    const metasAtingidas = grupo.metas?.filter((m) => m.status === 'atingida') || [];

    const evolucaoTemporal = this.gerarDadosGrafico(pedidosMes, inicioPeriodo, fimPeriodo);

    return {
      grupo: {
        id: grupo.id,
        nome: grupo.nome,
        descricao: grupo.descricao,
        totalVendedores: grupo.vendedores.length,
      },
      periodo: {
        inicio: inicioPeriodo,
        fim: fimPeriodo,
      },
      resumo: {
        totalPedidos: pedidosMes.length,
        pedidosEntregues: pedidosEntregues.length,
        totalFaturamento,
        ticketMedio,
        metasAtivas: metasAtivas.length,
        metasAtingidas: metasAtingidas.length,
      },
      porVendedor: statsPorVendedor,
      metas: grupo.metas?.map((m) => ({
        id: m.id,
        titulo: m.titulo,
        tipo: m.tipo,
        status: m.status,
        valorObjetivo: Number(m.valorObjetivo),
        valorAtual: Number(m.valorAtual),
        progressoPercentual: m.progressoPercentual,
      })) || [],
      evolucaoTemporal,
    };
  }

  private gerarDadosGrafico(pedidos: Pedido[], inicio: Date, fim: Date) {
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const faturamentoPorDia: { [key: string]: number } = {};
    const pedidosPorDia: { [key: string]: number } = {};
    const labels: string[] = [];

    let currentDate = new Date(inicio);
    while (currentDate <= fim) {
      const dateString = currentDate.toISOString().split('T')[0];
      faturamentoPorDia[dateString] = 0;
      pedidosPorDia[dateString] = 0;
      labels.push(dateString);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    pedidos.forEach((pedido) => {
      const dateString = pedido.dataPedido.toISOString().split('T')[0];
      if (faturamentoPorDia[dateString] !== undefined && pedido.status === 'entregue') {
        faturamentoPorDia[dateString] += Number(pedido.total || 0);
        pedidosPorDia[dateString] += 1;
      }
    });

    return labels.map((label) => ({
      data: label,
      faturamento: faturamentoPorDia[label] || 0,
      pedidos: pedidosPorDia[label] || 0,
    }));
  }

  private mapToResponse(grupo: GrupoVendedores) {
    return {
      id: grupo.id,
      nome: grupo.nome,
      descricao: grupo.descricao,
      empresaId: grupo.empresaId,
      ativo: grupo.ativo,
      gerenteId: grupo.gerenteId,
      gerente: grupo.gerente
        ? {
            id: grupo.gerente.id,
            nome: grupo.gerente.name,
            email: grupo.gerente.email || '',
            ativo: grupo.gerente.ativo,
          }
        : null,
      vendedores: (grupo.vendedores || []).map((gvu) => ({
        id: gvu.usuario.id,
        nome: gvu.usuario.name,
        email: gvu.usuario.email || '',
        ativo: gvu.usuario.ativo,
      })),
      criadoEm: grupo.criadoEm,
      atualizadoEm: grupo.atualizadoEm,
    };
  }

  async verificarENotificarGerente(empresaId: string, grupoId: number) {
    const grupo = await this.grupoRepository.findOne({
      where: { id: grupoId, empresaId },
      relations: ['metas', 'gerente'],
    });

    if (!grupo || !grupo.gerenteId) {
      return { message: 'Grupo não encontrado ou sem gerente', notificacoes: [] };
    }

    const notificacoesCriadas = [];

    for (const meta of grupo.metas || []) {
      if (meta.status !== 'ativa') continue;

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

      if (progresso >= 100) {
        notificacoesCriadas.push({
          tipo: 'success',
          titulo: `🎉 Meta Atingida: ${meta.titulo}`,
          mensagem: `A meta "${meta.titulo}" do grupo ${grupo.nome} foi atingida!`,
        });
      } else if (progresso < 50 && percentualTempo > 50) {
        notificacoesCriadas.push({
          tipo: 'warning',
          titulo: `⚠️ Meta em Risco: ${meta.titulo}`,
          mensagem: `A meta "${meta.titulo}" está em ${progresso}% com ${diasRestantes} dias restantes.`,
        });
      } else if (progresso >= 90 && progresso < 100) {
        notificacoesCriadas.push({
          tipo: 'info',
          titulo: `📈 Meta Quase Atingida: ${meta.titulo}`,
          mensagem: `A meta "${meta.titulo}" está em ${progresso}%!`,
        });
      }
    }

    return {
      message: `${notificacoesCriadas.length} situação(ões) encontrada(s)`,
      notificacoes: notificacoesCriadas,
    };
  }
}

