import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfiguracaoCreditoEntity, AcaoBloqueio } from './configuracao-credito.entity';
import { ContaReceberEntity, StatusReceberEntity } from '../financeiro/conta-receber.entity';
import { Cliente } from '../clientes/cliente.entity';

export interface VerificarCreditoResult {
  bloqueado: boolean;
  acao?: AcaoBloqueio;
  saldoDevedor: number;
  diasAtraso: number;
  limiteCredito: number;
  mensagem?: string;
}

@Injectable()
export class CreditoService {
  constructor(
    @InjectRepository(ConfiguracaoCreditoEntity)
    private readonly configRepo: Repository<ConfiguracaoCreditoEntity>,
    @InjectRepository(ContaReceberEntity)
    private readonly contaReceberRepo: Repository<ContaReceberEntity>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async obterConfig(empresaId: string, cliente?: Cliente): Promise<ConfiguracaoCreditoEntity | null> {
    const configs = await this.configRepo.find({
      where: { empresaId, ativo: true },
      order: { id: 'DESC' },
    });

    if (configs.length === 0) return null;

    if (cliente) {
      const especifica = configs.find(
        (c) =>
          (c.clienteTipo && c.clienteTipo === cliente.tipo) ||
          (c.clienteCategoriaId != null),
      );
      if (especifica) return especifica;
    }

    return configs.find((c) => !c.clienteTipo && c.clienteCategoriaId == null) ?? configs[0];
  }

  async calcularSaldoDevedor(clienteId: number, empresaId: string): Promise<{ saldo: number; diasAtraso: number }> {
    const statusAbertos: StatusReceberEntity[] = ['aberta', 'vencida', 'negociada'];
    const contas = await this.contaReceberRepo.find({
      where: {
        clienteId,
        empresaId,
        status: In(statusAbertos),
      },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let saldo = 0;
    let diasAtraso = 0;

    for (const conta of contas) {
      const valor = Number(conta.valor ?? 0);
      const valorPago = Number(conta.valorPago ?? 0);
      saldo += Math.max(valor - valorPago, 0);

      const vencimento = new Date(conta.vencimento);
      vencimento.setHours(0, 0, 0, 0);
      if (vencimento < hoje && conta.status !== 'recebida') {
        const diffMs = hoje.getTime() - vencimento.getTime();
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (dias > diasAtraso) diasAtraso = dias;
      }
    }

    return { saldo, diasAtraso };
  }

  async verificarCredito(
    clienteId: number,
    empresaId: string,
    valorPedido?: number,
  ): Promise<VerificarCreditoResult> {
    const cliente = await this.clienteRepo.findOne({
      where: { id: clienteId, empresaId },
    });
    if (!cliente) {
      return {
        bloqueado: false,
        saldoDevedor: 0,
        diasAtraso: 0,
        limiteCredito: Infinity,
        mensagem: 'Cliente não encontrado.',
      };
    }

    const config = await this.obterConfig(empresaId, cliente);
    if (!config) {
      return {
        bloqueado: false,
        saldoDevedor: 0,
        diasAtraso: 0,
        limiteCredito: Infinity,
      };
    }

    const { saldo: saldoDevedor, diasAtraso } = await this.calcularSaldoDevedor(clienteId, empresaId);

    const limiteCredito =
      cliente.limiteCredito != null
        ? Number(cliente.limiteCredito)
        : Number(config.limiteCreditoPadrao ?? 0);

    const diasTolerancia = config.diasToleranciaPadrao ?? 0;

    const excedeuLimite = limiteCredito > 0 && saldoDevedor > limiteCredito;
    const excedeuDias = diasTolerancia >= 0 && diasAtraso > diasTolerancia;

    const bloqueado = excedeuLimite || excedeuDias;

    let mensagem: string | undefined;
    if (bloqueado) {
      if (excedeuLimite && excedeuDias) {
        mensagem = `Cliente com saldo devedor de R$ ${saldoDevedor.toFixed(2)} (limite: R$ ${limiteCredito.toFixed(2)}) e título(s) em atraso há ${diasAtraso} dias.`;
      } else if (excedeuLimite) {
        mensagem = `Cliente com saldo devedor de R$ ${saldoDevedor.toFixed(2)} (limite: R$ ${limiteCredito.toFixed(2)}).`;
      } else {
        mensagem = `Cliente com título(s) em atraso há ${diasAtraso} dias (tolerância: ${diasTolerancia} dias).`;
      }
    }

    return {
      bloqueado,
      acao: bloqueado ? config.acaoBloqueio : undefined,
      saldoDevedor,
      diasAtraso,
      limiteCredito,
      mensagem,
    };
  }

  async listarConfiguracoes(empresaId: string): Promise<ConfiguracaoCreditoEntity[]> {
    return this.configRepo.find({
      where: { empresaId },
      order: { id: 'ASC' },
    });
  }

  async obterOuCriarConfigPadrao(empresaId: string): Promise<ConfiguracaoCreditoEntity> {
    let config = await this.configRepo.findOne({
      where: { empresaId, ativo: true },
    });

    if (!config) {
      config = this.configRepo.create({
        empresaId,
        limiteCreditoPadrao: 0,
        diasToleranciaPadrao: 0,
        acaoBloqueio: 'bloqueio_total',
        ativo: true,
      });
      await this.configRepo.save(config);
    }

    return config;
  }

  async salvarConfig(
    empresaId: string,
    dto: Partial<{
      limiteCreditoPadrao: number;
      diasToleranciaPadrao: number;
      acaoBloqueio: AcaoBloqueio;
      ativo: boolean;
    }>,
  ): Promise<ConfiguracaoCreditoEntity> {
    let config = await this.configRepo.findOne({
      where: { empresaId },
    });

    if (!config) {
      config = this.configRepo.create({
        empresaId,
        limiteCreditoPadrao: dto.limiteCreditoPadrao ?? 0,
        diasToleranciaPadrao: dto.diasToleranciaPadrao ?? 0,
        acaoBloqueio: dto.acaoBloqueio ?? 'bloqueio_total',
        ativo: dto.ativo ?? true,
      });
    } else {
      if (dto.limiteCreditoPadrao !== undefined) config.limiteCreditoPadrao = dto.limiteCreditoPadrao;
      if (dto.diasToleranciaPadrao !== undefined) config.diasToleranciaPadrao = dto.diasToleranciaPadrao;
      if (dto.acaoBloqueio !== undefined) config.acaoBloqueio = dto.acaoBloqueio;
      if (dto.ativo !== undefined) config.ativo = dto.ativo;
    }

    return this.configRepo.save(config);
  }
}
