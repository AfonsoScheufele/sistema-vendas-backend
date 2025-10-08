import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotacao } from './cotacao.entity';
import { CreateCotacaoDto } from './dto/create-cotacao.dto';
import { AdicionarPropostaDto, SelecionarVencedoraDto } from './dto/update-cotacao.dto';

@Injectable()
export class CotacoesService {
  constructor(
    @InjectRepository(Cotacao)
    private cotacaoRepo: Repository<Cotacao>,
  ) {}

  private gerarNumeroCotacao(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `COT-${timestamp}-${random}`;
  }

  async create(createCotacaoDto: CreateCotacaoDto): Promise<Cotacao> {
    const cotacao = this.cotacaoRepo.create({
      ...createCotacaoDto,
      numero: this.gerarNumeroCotacao(),
      status: (createCotacaoDto.status as 'aberta' | 'em_analise' | 'concluida' | 'cancelada') || 'aberta',
      propostas: [],
    });

    return await this.cotacaoRepo.save(cotacao) as unknown as Cotacao;
  }

  async findAll(status?: string): Promise<Cotacao[]> {
    const query = this.cotacaoRepo.createQueryBuilder('cotacao');

    if (status) {
      query.where('cotacao.status = :status', { status });
    }

    return await query
      .orderBy('cotacao.dataAbertura', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Cotacao> {
    const cotacao = await this.cotacaoRepo.findOne({ where: { id } });
    
    if (!cotacao) {
      throw new NotFoundException(`Cotação com ID ${id} não encontrada`);
    }
    
    return cotacao;
  }

  async update(id: number, updateCotacaoDto: any): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (cotacao.status === 'concluida') {
      throw new BadRequestException('Não é possível alterar uma cotação concluída');
    }

    Object.assign(cotacao, updateCotacaoDto);
    return await this.cotacaoRepo.save(cotacao);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cotacao = await this.findOne(id);
    
    if (cotacao.status === 'concluida') {
      throw new BadRequestException('Não é possível excluir uma cotação concluída');
    }

    await this.cotacaoRepo.remove(cotacao);
    return { message: 'Cotação removida com sucesso' };
  }

  async enviarParaFornecedor(id: number, fornecedorId: number): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (cotacao.status !== 'aberta') {
      throw new BadRequestException('Só é possível enviar cotações abertas');
    }

    // Aqui você implementaria a lógica de envio por email/SMS
    // Por enquanto, apenas atualizamos o status
    cotacao.status = 'em_analise';
    return await this.cotacaoRepo.save(cotacao);
  }

  async adicionarProposta(id: number, propostaDto: AdicionarPropostaDto): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (cotacao.status === 'concluida') {
      throw new BadRequestException('Não é possível adicionar propostas a uma cotação concluída');
    }

    const novaProposta = {
      id: Date.now(), // ID temporário
      ...propostaDto,
      fornecedorNome: cotacao.fornecedores.find(f => f.id === propostaDto.fornecedorId)?.nome || 'Fornecedor',
      dataProposta: new Date(),
    };

    if (!cotacao.propostas) {
      cotacao.propostas = [];
    }

    cotacao.propostas.push(novaProposta);
    return await this.cotacaoRepo.save(cotacao);
  }

  async selecionarVencedora(id: number, selecionarDto: SelecionarVencedoraDto): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (!cotacao.propostas || cotacao.propostas.length === 0) {
      throw new BadRequestException('Não há propostas para selecionar');
    }

    const proposta = cotacao.propostas.find(p => p.id === selecionarDto.propostaId);
    if (!proposta) {
      throw new NotFoundException('Proposta não encontrada');
    }

    cotacao.propostaVencedora = {
      fornecedorId: proposta.fornecedorId,
      valorTotal: proposta.valorTotal,
      prazoEntrega: proposta.prazoEntrega,
      condicoesPagamento: proposta.condicoesPagamento,
    };

    cotacao.status = 'concluida';
    cotacao.dataFechamento = new Date();

    return await this.cotacaoRepo.save(cotacao);
  }

  async fechar(id: number): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (cotacao.status === 'concluida') {
      throw new BadRequestException('Cotação já está concluída');
    }

    cotacao.status = 'concluida';
    cotacao.dataFechamento = new Date();

    return await this.cotacaoRepo.save(cotacao);
  }

  async cancelar(id: number, motivo: string): Promise<Cotacao> {
    const cotacao = await this.findOne(id);

    if (cotacao.status === 'concluida') {
      throw new BadRequestException('Não é possível cancelar uma cotação concluída');
    }

    cotacao.status = 'cancelada';
    cotacao.observacoes = `${cotacao.observacoes || ''}\nCancelada em ${new Date().toISOString()}: ${motivo}`.trim();

    return await this.cotacaoRepo.save(cotacao);
  }
}
