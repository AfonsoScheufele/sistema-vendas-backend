import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaEntity } from '../empresas/empresa.entity';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';
import { ProdutosService } from '../produtos/produtos.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfiguracoesService } from '../configuracoes/configuracoes.service';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { OrcamentosService } from '../orcamentos/orcamentos.service';
import { PedidosService } from '../pedidos/pedidos.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepo: Repository<EmpresaEntity>,
    @InjectRepository(UsuarioEmpresaEntity)
    private readonly usuarioEmpresaRepo: Repository<UsuarioEmpresaEntity>,
    @InjectRepository(Orcamento)
    private readonly orcamentoRepo: Repository<Orcamento>,
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly produtosService: ProdutosService,
    private readonly financeiroService: FinanceiroService,
    private readonly notificationsService: NotificationsService,
    private readonly configuracoesService: ConfiguracoesService,
    private readonly orcamentosService: OrcamentosService,
    private readonly pedidosService: PedidosService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async verificarEstoqueBaixo() {
    this.logger.log('Iniciando verificação de estoque baixo...');
    
    try {
      const empresas = await this.empresaRepo.find();
      
      for (const empresa of empresas) {
        try {
          const config = await this.configuracoesService.obterConfiguracao(empresa.id);
          
          if (!config?.alertasEstoque) {
            continue;
          }

          const produtosEstoqueBaixo = await this.produtosService.getEstoqueBaixo(empresa.id);
          
          if (produtosEstoqueBaixo.length === 0) {
            continue;
          }

          const usuariosEmpresa = await this.usuarioEmpresaRepo.find({
            where: { empresaId: empresa.id },
            relations: ['usuario'],
          });

          for (const produto of produtosEstoqueBaixo) {
            const estoqueMinimo = produto.estoqueMinimo || 0;
            const titulo = produto.estoque === 0 
              ? '🚨 Estoque Zerado' 
              : '⚠️ Estoque Baixo';
            const mensagem = produto.estoque === 0
              ? `O produto "${produto.nome}" está sem estoque. Estoque mínimo: ${estoqueMinimo} unidades.`
              : `O produto "${produto.nome}" está com estoque baixo (${produto.estoque} unidades). Estoque mínimo: ${estoqueMinimo} unidades.`;

            for (const usuarioEmpresa of usuariosEmpresa) {
              if (usuarioEmpresa.usuario?.id) {
                await this.notificationsService.criarNotificacao(
                  usuarioEmpresa.usuario.id,
                  titulo,
                  mensagem,
                  produto.estoque === 0 ? 'error' : 'warning',
                  'alta',
                );
              }
            }
          }

          this.logger.log(`Verificação de estoque concluída para empresa ${empresa.nome}: ${produtosEstoqueBaixo.length} produtos com estoque baixo`);
        } catch (error) {
          this.logger.error(`Erro ao verificar estoque para empresa ${empresa.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro na verificação de estoque baixo:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async verificarContasVencimento() {
    this.logger.log('Iniciando verificação de contas a vencer/vencidas...');
    
    try {
      const empresas = await this.empresaRepo.find();
      
      for (const empresa of empresas) {
        try {
          const config = await this.configuracoesService.obterConfiguracao(empresa.id);
          
          if (!config?.alertasVencimento) {
            continue;
          }

          const diasAlerta = config.diasAlertaVencimento || 7;
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const usuariosEmpresa = await this.usuarioEmpresaRepo.find({
            where: { empresaId: empresa.id },
            relations: ['usuario'],
          });

          const contasReceber = await this.financeiroService.listarContasReceber(empresa.id);
          
          for (const conta of contasReceber) {
            if (conta.status === 'recebida' || !conta.vencimento) {
              continue;
            }

            const vencimento = new Date(conta.vencimento);
            vencimento.setHours(0, 0, 0, 0);
            const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

            if (vencimento < hoje) {
              const titulo = '🔴 Conta a Receber Vencida';
              const mensagem = `A conta "${conta.titulo}" está vencida desde ${vencimento.toLocaleDateString('pt-BR')}. Valor: R$ ${conta.valor.toFixed(2)}`;

              for (const usuarioEmpresa of usuariosEmpresa) {
                if (usuarioEmpresa.usuario?.id) {
                  await this.notificationsService.criarNotificacao(
                    usuarioEmpresa.usuario.id,
                    titulo,
                    mensagem,
                    'error',
                    'alta',
                  );
                }
              }
            }
            else if (diasRestantes <= diasAlerta && diasRestantes >= 0) {
              const titulo = diasRestantes === 0 
                ? '⚠️ Conta a Receber Vence Hoje' 
                : `⏰ Conta a Receber Vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
              const mensagem = `A conta "${conta.titulo}" vence em ${diasRestantes === 0 ? 'hoje' : `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`}. Valor: R$ ${conta.valor.toFixed(2)}`;

              for (const usuarioEmpresa of usuariosEmpresa) {
                if (usuarioEmpresa.usuario?.id) {
                  await this.notificationsService.criarNotificacao(
                    usuarioEmpresa.usuario.id,
                    titulo,
                    mensagem,
                    diasRestantes === 0 ? 'error' : 'warning',
                    diasRestantes <= 3 ? 'alta' : 'normal',
                  );
                }
              }
            }
          }

          const contasPagar = await this.financeiroService.listarContasPagar(empresa.id);
          
          for (const conta of contasPagar) {
            if (conta.status === 'paga' || !conta.vencimento) {
              continue;
            }

            const vencimento = new Date(conta.vencimento);
            vencimento.setHours(0, 0, 0, 0);
            const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

            if (vencimento < hoje) {
              const titulo = '🔴 Conta a Pagar Vencida';
              const mensagem = `A conta "${conta.titulo}" está vencida desde ${vencimento.toLocaleDateString('pt-BR')}. Valor: R$ ${conta.valor.toFixed(2)}`;

              for (const usuarioEmpresa of usuariosEmpresa) {
                if (usuarioEmpresa.usuario?.id) {
                  await this.notificationsService.criarNotificacao(
                    usuarioEmpresa.usuario.id,
                    titulo,
                    mensagem,
                    'error',
                    'alta',
                  );
                }
              }
            }
            else if (diasRestantes <= diasAlerta && diasRestantes >= 0) {
              const titulo = diasRestantes === 0 
                ? '⚠️ Conta a Pagar Vence Hoje' 
                : `⏰ Conta a Pagar Vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
              const mensagem = `A conta "${conta.titulo}" vence em ${diasRestantes === 0 ? 'hoje' : `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`}. Valor: R$ ${conta.valor.toFixed(2)}`;

              for (const usuarioEmpresa of usuariosEmpresa) {
                if (usuarioEmpresa.usuario?.id) {
                  await this.notificationsService.criarNotificacao(
                    usuarioEmpresa.usuario.id,
                    titulo,
                    mensagem,
                    diasRestantes === 0 ? 'error' : 'warning',
                    diasRestantes <= 3 ? 'alta' : 'normal',
                  );
                }
              }
            }
          }

          this.logger.log(`Verificação de vencimentos concluída para empresa ${empresa.nome}`);
        } catch (error) {
          this.logger.error(`Erro ao verificar vencimentos para empresa ${empresa.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro na verificação de contas a vencer/vencidas:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expirarOrcamentos() {
    this.logger.log('Iniciando expiração automática de orçamentos...');
    
    try {
      const empresas = await this.empresaRepo.find();
      
      for (const empresa of empresas) {
        try {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const orcamentosExpirados = await this.orcamentoRepo
            .createQueryBuilder('orcamento')
            .where('orcamento.empresaId = :empresaId', { empresaId: empresa.id })
            .andWhere('orcamento.status IN (:...statuses)', { statuses: ['pendente', 'aprovado'] })
            .andWhere('orcamento.dataValidade < :hoje', { hoje })
            .getMany();

          if (orcamentosExpirados.length === 0) {
            continue;
          }

          for (const orcamento of orcamentosExpirados) {
            await this.orcamentosService.atualizar(orcamento.id, empresa.id, {
              status: 'expirado',
            });
          }

          this.logger.log(`Expiração de orçamentos concluída para empresa ${empresa.nome}: ${orcamentosExpirados.length} orçamentos expirados`);
        } catch (error) {
          this.logger.error(`Erro ao expirar orçamentos para empresa ${empresa.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro na expiração automática de orçamentos:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async atualizarStatusPedidos() {
    this.logger.log('Iniciando atualização automática de status de pedidos...');
    
    try {
      const empresas = await this.empresaRepo.find();
      
      for (const empresa of empresas) {
        try {
          const pedidosEmProducao = await this.pedidoRepo.find({
            where: { empresaId: empresa.id, status: 'em_producao' },
          });

          for (const pedido of pedidosEmProducao) {
            if (pedido.codigoRastreamento) {
              await this.pedidosService.atualizar(pedido.id, empresa.id, {
                status: 'enviado',
              });
              this.logger.log(`Pedido ${pedido.numero} atualizado para 'enviado' (tem rastreamento)`);
            }
          }

          const pedidosEnviados = await this.pedidoRepo.find({
            where: { empresaId: empresa.id, status: 'enviado' },
          });

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          for (const pedido of pedidosEnviados) {
            if (pedido.dataEntregaPrevista) {
              const dataEntrega = new Date(pedido.dataEntregaPrevista);
              dataEntrega.setHours(0, 0, 0, 0);
              
              const diasAtraso = Math.ceil((hoje.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
              if (diasAtraso >= 2) {
                await this.pedidosService.atualizar(pedido.id, empresa.id, {
                  status: 'entregue',
                  dataEntrega: pedido.dataEntregaPrevista,
                });
                this.logger.log(`Pedido ${pedido.numero} atualizado para 'entregue' (data prevista passou)`);
              }
            }
          }

          this.logger.log(`Atualização de status de pedidos concluída para empresa ${empresa.nome}`);
        } catch (error) {
          this.logger.error(`Erro ao atualizar status de pedidos para empresa ${empresa.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro na atualização automática de status de pedidos:', error);
    }
  }
}

