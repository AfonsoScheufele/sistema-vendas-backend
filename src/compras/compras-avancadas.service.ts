import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CotacaoEntity } from './cotacao.entity';
import { RequisicaoEntity } from './requisicao.entity';
import { PedidoCompraEntity } from './pedido-compra.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../auth/usuario.entity';
import { Perfil } from '../perfis/perfil.entity';

@Injectable()
export class ComprasAvancadasService {
  constructor(
    @InjectRepository(CotacaoEntity)
    private readonly cotacaoRepo: Repository<CotacaoEntity>,
    @InjectRepository(RequisicaoEntity)
    private readonly requisicaoRepo: Repository<RequisicaoEntity>,
    @InjectRepository(PedidoCompraEntity)
    private readonly pedidoCompraRepo: Repository<PedidoCompraEntity>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Perfil)
    private readonly perfilRepo: Repository<Perfil>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listarCotacoes(empresaId: string, filtros?: { status?: string }) {
    const query = this.cotacaoRepo
      .createQueryBuilder('cot')
      .where('cot.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('cot.status = :status', { status: filtros.status });
    }

    return query.orderBy('cot.criadoEm', 'DESC').getMany();
  }

  async criarCotacao(empresaId: string, data: Partial<CotacaoEntity>) {
    const cotacao = this.cotacaoRepo.create({ ...data, empresaId });
    return this.cotacaoRepo.save(cotacao);
  }

  async obterStatsCotacoes(empresaId: string) {
    const total = await this.cotacaoRepo.count({ where: { empresaId } });
    const abertas = await this.cotacaoRepo.count({ where: { empresaId, status: 'aberta' } });
    const fechadas = await this.cotacaoRepo.count({ where: { empresaId, status: 'fechada' } });
    const canceladas = await this.cotacaoRepo.count({ where: { empresaId, status: 'cancelada' } });
    return { total, abertas, fechadas, canceladas };
  }

  async listarRequisicoes(empresaId: string, filtros?: { status?: string }) {
    const query = this.requisicaoRepo
      .createQueryBuilder('req')
      .where('req.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('req.status = :status', { status: filtros.status });
    }

    return query.orderBy('req.criadoEm', 'DESC').getMany();
  }

  async criarRequisicao(empresaId: string, data: any) {
    if (data.valorEstimado !== undefined && data.valorTotal === undefined) {
      data.valorTotal = data.valorEstimado;
    }
    
    if (!data.numero) {
      const requisicoesExistentes = await this.requisicaoRepo.find({
        where: { empresaId },
        order: { criadoEm: 'DESC' },
        take: 1,
      });
      
      const proximoNumero = requisicoesExistentes.length > 0
        ? (parseInt(requisicoesExistentes[0].numero.replace('REQ-', '')) || 0) + 1
        : 1;
      
      data.numero = `REQ-${String(proximoNumero).padStart(6, '0')}`;
    }
    
    if (!data.valorTotal) {
      data.valorTotal = 0;
    }
    
    const { valorEstimado, ...requisicaoData } = data;
    
    const requisicao = this.requisicaoRepo.create({ ...requisicaoData, empresaId });
    const requisicaoSalva = await this.requisicaoRepo.save(requisicao);
    
    if (Array.isArray(requisicaoSalva)) {
      throw new Error('Erro ao salvar requisição: retornou array');
    }
    
    try {
      await this.notificarNovaRequisicao(requisicaoSalva, empresaId);
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar nova requisição:', error);
    }
    
    return requisicaoSalva;
  }

  async atualizarRequisicao(id: number, empresaId: string, data: Partial<RequisicaoEntity>) {
    const requisicao = await this.requisicaoRepo.findOne({ where: { id, empresaId } });
    if (!requisicao) {
      throw new NotFoundException('Requisição não encontrada');
    }
    Object.assign(requisicao, data);
    return this.requisicaoRepo.save(requisicao);
  }

  async obterStatsRequisicoes(empresaId: string) {
    const total = await this.requisicaoRepo.count({ where: { empresaId } });
    const pendentes = await this.requisicaoRepo.count({ where: { empresaId, status: 'pendente' } });
    const aprovadas = await this.requisicaoRepo.count({ where: { empresaId, status: 'aprovada' } });
    const rejeitadas = await this.requisicaoRepo.count({ where: { empresaId, status: 'rejeitada' } });
    const valorTotal = await this.requisicaoRepo
      .createQueryBuilder('req')
      .select('SUM(req.valorTotal)', 'total')
      .where('req.empresaId = :empresaId', { empresaId })
      .andWhere("req.status = 'aprovada'")
      .getRawOne();

    return {
      total,
      pendentes,
      aprovadas,
      rejeitadas,
      valorTotal: parseFloat(valorTotal?.total || '0'),
    };
  }

  async listarPedidosCompra(empresaId: string, filtros?: { status?: string }) {
    const query = this.pedidoCompraRepo
      .createQueryBuilder('ped')
      .where('ped.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('ped.status = :status', { status: filtros.status });
    }

    return query.orderBy('ped.criadoEm', 'DESC').getMany();
  }

  async criarPedidoCompra(empresaId: string, data: Partial<PedidoCompraEntity>) {
    const pedido = this.pedidoCompraRepo.create({ ...data, empresaId });
    return this.pedidoCompraRepo.save(pedido);
  }

  async atualizarPedidoCompra(id: number, empresaId: string, data: Partial<PedidoCompraEntity>) {
    const pedido = await this.pedidoCompraRepo.findOne({ where: { id, empresaId } });
    if (!pedido) {
      throw new NotFoundException('Pedido de compra não encontrado');
    }
    Object.assign(pedido, data);
    return this.pedidoCompraRepo.save(pedido);
  }

  async obterStatsPedidosCompra(empresaId: string) {
    const total = await this.pedidoCompraRepo.count({ where: { empresaId } });
    const rascunho = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'rascunho' } });
    const enviado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'enviado' } });
    const confirmado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'confirmado' } });
    const recebido = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'recebido' } });
    const cancelado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'cancelado' } });
    return { total, rascunho, enviado, confirmado, recebido, cancelado };
  }

  async aprovarRequisicao(id: number, empresaId: string, aprovadorNome?: string) {
    const requisicao = await this.requisicaoRepo.findOne({ where: { id, empresaId } });
    if (!requisicao) {
      throw new NotFoundException('Requisição não encontrada');
    }
    
    requisicao.status = 'aprovada';
    requisicao.aprovador = aprovadorNome || 'Sistema';
    requisicao.dataAprovacao = new Date();
    const requisicaoAtualizada = await this.requisicaoRepo.save(requisicao);
    
    try {
      await this.notificarAprovacaoRequisicao(requisicaoAtualizada, empresaId);
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar aprovação:', error);
    }
    
    return requisicaoAtualizada;
  }

  async rejeitarRequisicao(id: number, empresaId: string, motivo: string, rejeitadorNome?: string) {
    const requisicao = await this.requisicaoRepo.findOne({ where: { id, empresaId } });
    if (!requisicao) {
      throw new NotFoundException('Requisição não encontrada');
    }
    
    requisicao.status = 'rejeitada';
    requisicao.aprovador = rejeitadorNome || 'Sistema';
    requisicao.observacoes = motivo;
    const requisicaoAtualizada = await this.requisicaoRepo.save(requisicao);
    
    try {
      await this.notificarRejeicaoRequisicao(requisicaoAtualizada, empresaId, motivo);
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar rejeição:', error);
    }
    
    return requisicaoAtualizada;
  }

  private async obterUsuariosComPermissao(permissao: string): Promise<Usuario[]> {
    try {
      const usuarios = await this.usuarioRepo.find({
        where: { ativo: true },
      });

      const usuariosComPermissao: Usuario[] = [];

      for (const usuario of usuarios) {
        if (usuario.role === 'Admin') {
          usuariosComPermissao.push(usuario);
          continue;
        }

        const perfil = await this.perfilRepo.findOne({
          where: { nome: usuario.role },
        });

        if (!perfil) continue;

        const permissoes = (perfil.permissoes || [])
          .map((p: string) => (p || '').trim())
          .filter((p: string) => p.length > 0);

        if (permissoes.includes(permissao)) {
          usuariosComPermissao.push(usuario);
        }
      }

      return usuariosComPermissao;
    } catch (error) {
      console.error(`[ComprasAvancadasService] Erro ao buscar usuários com permissão ${permissao}:`, error);
      return [];
    }
  }

  private async notificarNovaRequisicao(requisicao: RequisicaoEntity, empresaId: string): Promise<void> {
    try {
      const usuarios = await this.obterUsuariosComPermissao('requisicoes.edit');
      
      if (usuarios.length === 0) {
        return;
      }

      const valorFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(Number(requisicao.valorTotal || 0));

      for (const usuario of usuarios) {
        await this.notificationsService.criarNotificacao(
          usuario.id,
          '📋 Nova Requisição de Compra',
          `Requisição ${requisicao.numero} criada por ${requisicao.solicitante || 'Sistema'}. Valor: ${valorFormatado}. Aguardando aprovação.`,
          'info',
          'high',
        );
      }
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar nova requisição:', error);
    }
  }

  private async notificarAprovacaoRequisicao(requisicao: RequisicaoEntity, empresaId: string): Promise<void> {
    try {
      const valorFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(Number(requisicao.valorTotal || 0));

      if (requisicao.solicitanteId) {
        await this.notificationsService.criarNotificacao(
          requisicao.solicitanteId,
          '✅ Requisição Aprovada',
          `Sua requisição ${requisicao.numero} foi aprovada por ${requisicao.aprovador || 'Gestor'}. Valor: ${valorFormatado}.`,
          'success',
          'normal',
        );
      } else {
        const usuarios = await this.obterUsuariosComPermissao('requisicoes.create');
        for (const usuario of usuarios) {
          await this.notificationsService.criarNotificacao(
            usuario.id,
            '✅ Requisição Aprovada',
            `A requisição ${requisicao.numero} foi aprovada por ${requisicao.aprovador || 'Gestor'}. Valor: ${valorFormatado}.`,
            'success',
            'normal',
          );
        }
      }
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar aprovação:', error);
    }
  }

  private async notificarRejeicaoRequisicao(requisicao: RequisicaoEntity, empresaId: string, motivo: string): Promise<void> {
    try {
      const valorFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(Number(requisicao.valorTotal || 0));

      if (requisicao.solicitanteId) {
        await this.notificationsService.criarNotificacao(
          requisicao.solicitanteId,
          '❌ Requisição Rejeitada',
          `Sua requisição ${requisicao.numero} foi rejeitada por ${requisicao.aprovador || 'Gestor'}. Motivo: ${motivo}. Valor: ${valorFormatado}.`,
          'error',
          'normal',
        );
      } else {
        const usuarios = await this.obterUsuariosComPermissao('requisicoes.create');
        for (const usuario of usuarios) {
          await this.notificationsService.criarNotificacao(
            usuario.id,
            '❌ Requisição Rejeitada',
            `A requisição ${requisicao.numero} foi rejeitada por ${requisicao.aprovador || 'Gestor'}. Motivo: ${motivo}. Valor: ${valorFormatado}.`,
            'error',
            'normal',
          );
        }
      }
    } catch (error) {
      console.error('[ComprasAvancadasService] Erro ao notificar rejeição:', error);
    }
  }
}

