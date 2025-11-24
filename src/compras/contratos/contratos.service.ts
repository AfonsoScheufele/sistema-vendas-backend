import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { CONTRATO_STATUS, Contrato, ContratoStats, ContratoStatus } from './contrato.interface';
import { ContratoEntity } from './contrato.entity';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(ContratoEntity)
    private readonly contratoRepo: Repository<ContratoEntity>,
  ) {}

  // Seed removido - não criar dados automaticamente
  // async onModuleInit() {
  //   // Seed removido para evitar dados hardcoded
  // }

  async listar(empresaId: string): Promise<Contrato[]> {
    if (!empresaId) {
      return [];
    }
    try {
      const contratos = await this.contratoRepo.find({
        where: { empresaId },
        order: { dataFim: 'ASC' },
      });
      return contratos.map((contrato) => this.mapToResponse(contrato));
    } catch (error) {
      console.error('Erro ao listar contratos:', error);
      throw error;
    }
  }

  async obterPorId(id: string, empresaId: string): Promise<Contrato> {
    if (!empresaId) {
      throw new NotFoundException('Contrato não encontrado');
    }
    try {
      const contrato = await this.contratoRepo.findOne({ where: { id, empresaId } });
      if (!contrato) {
        throw new NotFoundException('Contrato não encontrado');
      }
      return this.mapToResponse(contrato);
    } catch (error) {
      console.error('Erro ao obter contrato por ID:', error, { id, empresaId });
      throw error;
    }
  }

  async criar(dto: CreateContratoDto, empresaId: string): Promise<Contrato> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório');
    }
    try {
      const contrato = this.contratoRepo.create({
        empresaId,
        numero: dto.numero,
        fornecedor: dto.fornecedor,
        descricao: dto.descricao ?? null,
        valor: dto.valor,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
        status: dto.status,
        tipo: dto.tipo,
        responsavel: dto.responsavel,
      });
      const salvo = await this.contratoRepo.save(contrato);
      return this.mapToResponse(salvo);
    } catch (error) {
      console.error('Erro ao criar contrato:', error, dto);
      throw error;
    }
  }

  async obterEstatisticas(empresaId: string): Promise<ContratoStats> {
    if (!empresaId) {
      return {
        total: 0,
        porStatus: {
          ativo: 0,
          vencido: 0,
          cancelado: 0,
          renovado: 0,
        },
        valorTotal: 0,
        vigentes: 0,
        vencendoEm30Dias: 0,
      };
    }
    try {
      const contratos = await this.contratoRepo.find({ where: { empresaId } });
      const total = contratos.length;
      const porStatus = CONTRATO_STATUS.reduce((acc, status) => {
        acc[status] = contratos.filter((contrato) => contrato.status === status).length;
        return acc;
      }, {} as Record<ContratoStatus, number>);

      const valorTotal = contratos.reduce((acc, contrato) => {
        const valor = typeof contrato.valor === 'string' ? parseFloat(contrato.valor) : Number(contrato.valor ?? 0);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

      const hoje = new Date();
      const trintaDias = 1000 * 60 * 60 * 24 * 30;

      const vigentes = contratos.filter((contrato) => {
        try {
          const inicio = contrato.dataInicio instanceof Date 
            ? contrato.dataInicio.getTime() 
            : new Date(contrato.dataInicio).getTime();
          const fim = contrato.dataFim instanceof Date 
            ? contrato.dataFim.getTime() 
            : new Date(contrato.dataFim).getTime();
          const hojeTime = hoje.getTime();
          return inicio <= hojeTime && fim >= hojeTime;
        } catch {
          return false;
        }
      }).length;

      const vencendoEm30Dias = contratos.filter((contrato) => {
        try {
          const fim = contrato.dataFim instanceof Date 
            ? contrato.dataFim.getTime() 
            : new Date(contrato.dataFim).getTime();
          const diff = fim - hoje.getTime();
          return diff > 0 && diff <= trintaDias;
        } catch {
          return false;
        }
      }).length;

      return {
        total,
        porStatus,
        valorTotal,
        vigentes,
        vencendoEm30Dias,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de contratos:', error);
      throw error;
    }
  }

  private mapToResponse(entity: ContratoEntity): Contrato {
    try {
      // Converter valor decimal (pode vir como string do banco)
      let valor = 0;
      if (entity.valor !== null && entity.valor !== undefined) {
        if (typeof entity.valor === 'string') {
          valor = parseFloat(entity.valor);
        } else if (typeof entity.valor === 'number') {
          valor = entity.valor;
        }
        if (isNaN(valor)) {
          valor = 0;
        }
      }

      // Converter datas
      const formatarData = (data: Date | string | null | undefined): string => {
        if (!data) return new Date().toISOString();
        if (data instanceof Date) return data.toISOString();
        const parsed = new Date(data);
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      };

      return {
        id: entity.id,
        numero: entity.numero,
        fornecedor: entity.fornecedor,
        descricao: entity.descricao ?? '',
        valor,
        dataInicio: formatarData(entity.dataInicio),
        dataFim: formatarData(entity.dataFim),
        status: entity.status as ContratoStatus,
        tipo: entity.tipo as any,
        responsavel: entity.responsavel,
        empresaId: entity.empresaId,
        criadoEm: formatarData(entity.criadoEm),
        atualizadoEm: formatarData(entity.atualizadoEm),
      };
    } catch (error) {
      console.error('Erro ao mapear contrato:', error, entity);
      throw error;
    }
  }
}
