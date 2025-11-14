import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import {
  Fornecedor,
  FornecedorStatus,
  FornecedorProdutoResumo,
  FornecedorContato,
  FornecedorEndereco,
} from './fornecedor.interface';
import { FornecedorEntity } from './fornecedor.entity';
import { FornecedorProdutoEntity } from './fornecedor-produto.entity';

@Injectable()
export class FornecedoresService implements OnModuleInit {
  constructor(
    @InjectRepository(FornecedorEntity)
    private readonly fornecedorRepo: Repository<FornecedorEntity>,
    @InjectRepository(FornecedorProdutoEntity)
    private readonly produtoRepo: Repository<FornecedorProdutoEntity>,
  ) {}

  async onModuleInit() {
    const total = await this.fornecedorRepo.count();
    if (total > 0) {
      return;
    }

    const agora = new Date();
    const fornecedoresSeed: Array<{
      dados: CreateFornecedorDto;
      empresaId: string;
    }> = [
      {
        empresaId: 'default-empresa',
        dados: {
          nome: 'Fornecedor ABC Ltda',
          razaoSocial: 'Fornecedor ABC Soluções Empresariais Ltda',
          cnpj: '12.345.678/0001-99',
          endereco: {
            logradouro: 'Rua das Flores',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01000-000',
          },
          contato: {
            nome: 'Ana Ribeiro',
            cargo: 'Executiva de Contas',
            telefone: '(11) 3333-4444',
            email: 'ana.ribeiro@fornecedorabc.com',
            celular: '(11) 95555-6666',
          },
          bancario: {
            banco: 'Itaú',
            agencia: '1234',
            conta: '56789-0',
            tipoConta: 'corrente',
          },
          categoria: 'materiais',
          status: 'ativo',
          observacoes: 'Fornecedor estratégico para materiais de escritório.',
          produtos: [
            { id: 1, nome: 'Papel A4 500 folhas', categoria: 'Papelaria', precoMedio: 18.5 },
            { id: 2, nome: 'Cartucho de tinta preto HP', categoria: 'Insumos', precoMedio: 95.9 },
          ],
        },
      },
      {
        empresaId: 'default-empresa',
        dados: {
          nome: 'TechCorp S.A.',
          razaoSocial: 'TechCorp Tecnologia S.A.',
          cnpj: '98.765.432/0001-55',
          endereco: {
            logradouro: 'Av. Paulista',
            numero: '1500',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01310-200',
          },
          contato: {
            nome: 'Bruno Mendes',
            cargo: 'Diretor Comercial',
            telefone: '(11) 4000-5000',
            email: 'bruno.mendes@techcorp.com',
          },
          bancario: {
            banco: 'Bradesco',
            agencia: '4567',
            conta: '12345-6',
            tipoConta: 'corrente',
          },
          categoria: 'tecnologia',
          status: 'ativo',
          produtos: [{ id: 10, nome: 'ERP Empresarial', categoria: 'Software', precoMedio: 120000 }],
        },
      },
      {
        empresaId: 'empresa-sul',
        dados: {
          nome: 'LogTech Serviços',
          razaoSocial: 'LogTech Serviços Logísticos Ltda',
          cnpj: '11.222.333/0001-44',
          endereco: {
            logradouro: 'Rua das Indústrias',
            numero: '800',
            bairro: 'Distrito Industrial',
            cidade: 'Curitiba',
            estado: 'PR',
            cep: '80000-000',
          },
          contato: {
            nome: 'Carla Souza',
            cargo: 'Gerente de Contas',
            telefone: '(41) 3333-2211',
            email: 'carla.souza@logtech.com',
          },
          bancario: {
            banco: 'Santander',
            agencia: '3210',
            conta: '98765-4',
            tipoConta: 'corrente',
          },
          categoria: 'logistica',
          status: 'ativo',
          produtos: [{ id: 30, nome: 'Transporte rodoviário', categoria: 'Serviço', precoMedio: 3500 }],
        },
      },
    ];

    for (const seed of fornecedoresSeed) {
      await this.criar(seed.dados, seed.empresaId);
    }
  }

  async listar(empresaId: string, status?: FornecedorStatus, search?: string): Promise<Fornecedor[]> {
    const query = this.fornecedorRepo
      .createQueryBuilder('fornecedor')
      .leftJoinAndSelect('fornecedor.produtos', 'produtos')
      .where('fornecedor.empresaId = :empresaId', { empresaId });

    if (status) {
      query.andWhere('fornecedor.status = :status', { status });
    }

    if (search) {
      const termo = `%${search.toLowerCase()}%`;
      query.andWhere(
        'LOWER(fornecedor.nome) LIKE :termo OR LOWER(fornecedor.razaoSocial) LIKE :termo OR LOWER(fornecedor.cnpj) LIKE :termo',
        { termo },
      );
    }

    const fornecedores = await query.orderBy('fornecedor.nome', 'ASC').getMany();
    return fornecedores.map((fornecedor) => this.mapToResponse(fornecedor));
  }

  async buscarPorId(id: string, empresaId: string): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({
      where: { id, empresaId },
    });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    return this.mapToResponse(fornecedor);
  }

  async criar(dto: CreateFornecedorDto, empresaId: string): Promise<Fornecedor> {
    const agora = new Date();
    const fornecedor = this.fornecedorRepo.create({
      empresaId,
      nome: dto.nome,
      razaoSocial: dto.razaoSocial,
      cnpj: dto.cnpj,
      inscricaoEstadual: dto.inscricaoEstadual ?? null,
      inscricaoMunicipal: dto.inscricaoMunicipal ?? null,
      endereco: dto.endereco as FornecedorEndereco,
      contato: dto.contato as FornecedorContato,
      bancario: dto.bancario ?? null,
      categoria: dto.categoria,
      status: dto.status,
      observacoes: dto.observacoes ?? null,
      dataCadastro: agora,
      produtos: (dto.produtos ?? []).map((produto) =>
        this.produtoRepo.create({
          empresaId,
          codigo: produto.id ?? null,
          nome: produto.nome,
          categoria: produto.categoria,
          precoMedio: produto.precoMedio ?? 0,
        }),
      ),
    });

    const salvo = await this.fornecedorRepo.save(fornecedor);
    return this.mapToResponse(salvo);
  }

  async atualizar(
    id: string,
    empresaId: string,
    dados: Partial<CreateFornecedorDto>,
  ): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id, empresaId } });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    if (dados.endereco) fornecedor.endereco = dados.endereco as FornecedorEndereco;
    if (dados.contato) fornecedor.contato = dados.contato as FornecedorContato;
    if (dados.bancario !== undefined) fornecedor.bancario = dados.bancario ?? null;
    if (dados.nome !== undefined) fornecedor.nome = dados.nome;
    if (dados.razaoSocial !== undefined) fornecedor.razaoSocial = dados.razaoSocial;
    if (dados.cnpj !== undefined) fornecedor.cnpj = dados.cnpj;
    if (dados.inscricaoEstadual !== undefined) fornecedor.inscricaoEstadual = dados.inscricaoEstadual ?? null;
    if (dados.inscricaoMunicipal !== undefined) fornecedor.inscricaoMunicipal = dados.inscricaoMunicipal ?? null;
    if (dados.categoria !== undefined) fornecedor.categoria = dados.categoria;
    if (dados.status !== undefined) fornecedor.status = dados.status;
    if (dados.observacoes !== undefined) fornecedor.observacoes = dados.observacoes ?? null;

    await this.fornecedorRepo.save(fornecedor);

    if (dados.produtos) {
      await this.produtoRepo
        .createQueryBuilder()
        .delete()
        .where('fornecedor_id = :fornecedorId', { fornecedorId: fornecedor.id })
        .execute();

      const novosProdutos = dados.produtos.map((produto) =>
        this.produtoRepo.create({
          empresaId,
          fornecedorId: fornecedor.id,
          codigo: produto.id ?? null,
          nome: produto.nome,
          categoria: produto.categoria,
          precoMedio: produto.precoMedio ?? 0,
        }),
      );
      await this.produtoRepo.save(novosProdutos);
    }

    const atualizado = await this.fornecedorRepo.findOne({ where: { id, empresaId } });
    if (!atualizado) {
      throw new NotFoundException('Fornecedor não encontrado após atualização');
    }
    return this.mapToResponse(atualizado);
  }

  async alterarStatus(
    id: string,
    empresaId: string,
    status: FornecedorStatus,
    observacao?: string,
  ): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id, empresaId } });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    const anotacao = observacao
      ? `${fornecedor.observacoes ? `${fornecedor.observacoes}\n` : ''}Status alterado para ${status} em ${new Date().toLocaleString('pt-BR')} - ${observacao}`
      : fornecedor.observacoes ?? null;

    fornecedor.status = status;
    fornecedor.observacoes = anotacao;
    await this.fornecedorRepo.save(fornecedor);
    return this.mapToResponse(fornecedor);
  }

  async listarProdutos(id: string, empresaId: string): Promise<FornecedorProdutoResumo[]> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id, empresaId } });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    const produtos = await this.produtoRepo.find({
      where: { fornecedorId: fornecedor.id, empresaId },
      order: { nome: 'ASC' },
    });
    return produtos.map((produto) => ({
      id: produto.codigo ?? (parseInt(produto.id.slice(0, 6), 16) || 0),
      nome: produto.nome,
      categoria: produto.categoria ?? '',
      precoMedio: Number(produto.precoMedio ?? 0),
    }));
  }

  async remover(id: string, empresaId: string): Promise<void> {
    const resultado = await this.fornecedorRepo.delete({ id, empresaId });
    if (resultado.affected === 0) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
  }

  async obterEstatisticas(empresaId: string) {
    const fornecedores = await this.fornecedorRepo.find({ where: { empresaId } });
    if (!fornecedores.length) {
      return {
        total: 0,
        ativos: 0,
        bloqueados: 0,
        inativos: 0,
        categorias: {},
      };
    }

    const total = fornecedores.length;
    const ativos = fornecedores.filter((item) => item.status === 'ativo').length;
    const bloqueados = fornecedores.filter((item) => item.status === 'bloqueado').length;
    const inativos = fornecedores.filter((item) => item.status === 'inativo').length;
    const categorias = fornecedores.reduce<Record<string, number>>((acc, fornecedor) => {
      acc[fornecedor.categoria] = (acc[fornecedor.categoria] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total,
      ativos,
      bloqueados,
      inativos,
      categorias,
    };
  }

  private mapToResponse(entity: FornecedorEntity): Fornecedor {
    const produtos = (entity.produtos ?? []).map((produto) => ({
      id: produto.codigo ?? (parseInt(produto.id.slice(0, 6), 16) || 0),
      nome: produto.nome,
      categoria: produto.categoria ?? '',
      precoMedio: Number(produto.precoMedio ?? 0),
    }));

    return {
      id: entity.id,
      nome: entity.nome,
      razaoSocial: entity.razaoSocial,
      cnpj: entity.cnpj,
      inscricaoEstadual: entity.inscricaoEstadual ?? undefined,
      inscricaoMunicipal: entity.inscricaoMunicipal ?? undefined,
      endereco: entity.endereco as FornecedorEndereco,
      contato: entity.contato as FornecedorContato,
      bancario: (entity.bancario ?? {}) as Fornecedor['bancario'],
      categoria: entity.categoria as any,
      status: entity.status as FornecedorStatus,
      dataCadastro: entity.dataCadastro.toISOString(),
      observacoes: entity.observacoes ?? undefined,
      produtos,
      empresaId: entity.empresaId,
      criadoEm: entity.criadoEm.toISOString(),
      atualizadoEm: entity.atualizadoEm.toISOString(),
    };
  }
}
