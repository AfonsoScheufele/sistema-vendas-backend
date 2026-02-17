import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto, empresaId: string): Promise<Cliente> {
    if (!empresaId) {
      throw new NotFoundException('Empresa não identificada. Por favor, selecione uma empresa.');
    }

    const emailExiste = await this.clienteRepo.findOne({
      where: { email: createClienteDto.email.toLowerCase(), empresaId }
    });

    if (emailExiste) {
      throw new ConflictException('Email já cadastrado');
    }

    const consentimentoMarketing = createClienteDto.consentimentoMarketing === true;
    const cliente = this.clienteRepo.create({
      ...createClienteDto,
      email: createClienteDto.email?.toLowerCase() || createClienteDto.email,
      telefone: createClienteDto.telefone?.replace(/\D/g, '') || createClienteDto.telefone,
      cpf_cnpj: createClienteDto.cpf_cnpj ? createClienteDto.cpf_cnpj.replace(/\D/g, '') : undefined,
      empresaId,
      consentimentoMarketing,
      dataConsentimentoMarketing: consentimentoMarketing ? new Date() : undefined,
    });

    return await this.clienteRepo.save(cliente);
  }

  private buildQuery(
    empresaId: string,
    filtros?: { tipo?: string; ativo?: string; search?: string },
    orderBy: string = 'criadoEm',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = this.clienteRepo.createQueryBuilder('cliente');

    query.where('cliente.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo && filtros.tipo !== 'todos') {
      query.andWhere('cliente.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.ativo !== undefined) {
      const ativo = filtros.ativo === 'true';
      query.andWhere('cliente.ativo = :ativo', { ativo });
    }

    if (filtros?.search) {
      const searchTerm = `%${filtros.search}%`;
      const digitsOnly = filtros.search.replace(/\D/g, '');
      const conditions = ['cliente.nome ILIKE :search', 'cliente.email ILIKE :search', 'cliente.cpf_cnpj ILIKE :search'];
      const params: Record<string, string> = { search: searchTerm };
      if (digitsOnly.length > 0) {
        conditions.push('(cliente.cpf_cnpj IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(cliente.cpf_cnpj, \'.\', \'\'), \'-\', \'\'), \'/\', \'\'), \' \', \'\') LIKE :searchDigits)');
        params.searchDigits = `%${digitsOnly}%`;
      }
      query.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    const allowedOrderBy = ['nome', 'email', 'criadoEm', 'atualizadoEm'];
    const sortBy = allowedOrderBy.includes(orderBy) ? orderBy : 'criadoEm';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(`cliente.${sortBy}`, sortOrder);

    return query;
  }

  async findAll(
    empresaId: string,
    filtros?: { tipo?: string; ativo?: string; search?: string },
    orderBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<Cliente[]> {
    return this.buildQuery(empresaId, filtros, orderBy ?? 'criadoEm', order ?? 'DESC').getMany();
  }

  async findAllPaginated(
    empresaId: string,
    filtros: { tipo?: string; ativo?: string; search?: string } | undefined,
    page: number,
    limit: number,
    orderBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<{ data: Cliente[]; total: number }> {
    const qb = this.buildQuery(empresaId, filtros, orderBy ?? 'criadoEm', order ?? 'DESC');
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total };
  }

  async getTipos(empresaId: string) {
    const result = await this.clienteRepo
      .createQueryBuilder('cliente')
      .where('cliente.empresaId = :empresaId', { empresaId })
      .select('DISTINCT cliente.tipo', 'tipo')
      .getRawMany();

    return result.map(item => item.tipo);
  }

  async getClientesNovos(empresaId: string, periodo?: string) {
    const query = this.clienteRepo.createQueryBuilder('cliente');

    query.where('cliente.empresaId = :empresaId', { empresaId });

    if (periodo === 'mes') {
      query.andWhere('cliente.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
    } else if (periodo === 'semana') {
      query.andWhere('cliente.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });
    }

    return query.orderBy('cliente.criadoEm', 'DESC').getMany();
  }

  async getVendasCliente(id: number, empresaId: string) {
    const cliente = await this.findOne(id, empresaId);

    return {
      cliente,
      vendas: [],
      totalVendas: 0
    };
  }

  async findOne(id: number, empresaId: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id, empresaId } });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return cliente;
  }

  async update(id: number, empresaId: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id, empresaId);

    if (updateClienteDto.email && updateClienteDto.email.toLowerCase() !== cliente.email) {
      const emailExiste = await this.clienteRepo.findOne({
        where: { email: updateClienteDto.email.toLowerCase(), empresaId }
      });

      if (emailExiste) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    const dadosAtualizados: any = {
      ...updateClienteDto,
      email: updateClienteDto.email ? updateClienteDto.email.toLowerCase() : undefined,
      telefone: updateClienteDto.telefone ? updateClienteDto.telefone.replace(/\D/g, '') : undefined,
      cpf_cnpj: updateClienteDto.cpf_cnpj ? updateClienteDto.cpf_cnpj.replace(/\D/g, '') : undefined,
    };

    if (updateClienteDto.consentimentoMarketing !== undefined) {
      dadosAtualizados.consentimentoMarketing = updateClienteDto.consentimentoMarketing;
      dadosAtualizados.dataConsentimentoMarketing = updateClienteDto.consentimentoMarketing ? new Date() : null;
    }

    Object.assign(cliente, dadosAtualizados);
    return await this.clienteRepo.save(cliente);
  }

  async remove(id: number, empresaId: string): Promise<{ message: string }> {
    const cliente = await this.findOne(id, empresaId);
    await this.clienteRepo.remove(cliente);
    return { message: 'Cliente removido com sucesso' };
  }

  async getStats(empresaId: string) {
    const totalClientes = await this.clienteRepo.count({ where: { empresaId } });

    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const clientesRecentes = await this.clienteRepo.count({
      where: {
        empresaId,
        criadoEm: MoreThan(trintaDiasAtras),
      },
    });

    return {
      totalClientes,
      clientesRecentes,
    };
  }
}