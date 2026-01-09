import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracaoPaginaEntity } from './configuracao-pagina.entity';

export interface CreateConfiguracaoPaginaDto {
  paginaId: string;
  nomePagina: string;
  layout?: string;
  itensPorPagina?: number;
  ordenacaoPadrao?: {
    campo: string;
    direcao: 'asc' | 'desc';
  };
  campos?: Array<{
    id: string;
    nome: string;
    visivel: boolean;
    ordem: number;
    largura?: string;
  }>;
  filtros?: Array<{
    id: string;
    nome: string;
    ativo: boolean;
    valorPadrao?: string;
  }>;
  mostrarBusca?: boolean;
  mostrarFiltros?: boolean;
  mostrarExportacao?: boolean;
  mostrarEstatisticas?: boolean;
  coresPersonalizadas?: {
    primaria?: string;
    secundaria?: string;
  };
}

export interface UpdateConfiguracaoPaginaDto extends Partial<Omit<CreateConfiguracaoPaginaDto, 'paginaId'>> {}

@Injectable()
export class ConfiguracoesPaginasService {
  constructor(
    @InjectRepository(ConfiguracaoPaginaEntity)
    private readonly configRepository: Repository<ConfiguracaoPaginaEntity>,
  ) {}

  async obterConfiguracao(paginaId: string, empresaId: string): Promise<ConfiguracaoPaginaEntity | null> {
    return this.configRepository.findOne({
      where: { paginaId, empresaId },
    });
  }

  async criarOuAtualizar(
    paginaId: string,
    empresaId: string,
    dto: CreateConfiguracaoPaginaDto | UpdateConfiguracaoPaginaDto,
  ): Promise<ConfiguracaoPaginaEntity> {
    const existente = await this.obterConfiguracao(paginaId, empresaId);

    if (existente) {
      Object.assign(existente, dto);
      return this.configRepository.save(existente);
    }

    const novaConfig = this.configRepository.create({
      ...dto,
      paginaId,
      nomePagina: (dto as CreateConfiguracaoPaginaDto).nomePagina || paginaId,
      empresaId,
    });

    return this.configRepository.save(novaConfig);
  }

  async listar(empresaId: string): Promise<ConfiguracaoPaginaEntity[]> {
    return this.configRepository.find({
      where: { empresaId },
      order: { nomePagina: 'ASC' },
    });
  }

  async excluir(paginaId: string, empresaId: string): Promise<void> {
    const config = await this.obterConfiguracao(paginaId, empresaId);
    if (!config) {
      throw new NotFoundException('Configuração não encontrada');
    }
    await this.configRepository.remove(config);
  }
}

