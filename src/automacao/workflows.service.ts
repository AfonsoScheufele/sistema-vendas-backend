import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepo: Repository<Workflow>,
  ) {}

  async findAll(empresaId: string): Promise<Workflow[]> {
    return await this.workflowRepo.find({
      where: { empresaId },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number, empresaId: string): Promise<Workflow> {
    const workflow = await this.workflowRepo.findOne({ where: { id, empresaId } });
    if (!workflow) {
      throw new NotFoundException('Workflow não encontrado');
    }
    return workflow;
  }

  async create(empresaId: string, data: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflowRepo.create({ ...data, empresaId });
    return await this.workflowRepo.save(workflow);
  }

  async update(id: number, empresaId: string, data: Partial<Workflow>): Promise<Workflow> {
    await this.workflowRepo.update({ id, empresaId }, data);
    return await this.findOne(id, empresaId);
  }

  async delete(id: number, empresaId: string): Promise<void> {
    const result = await this.workflowRepo.delete({ id, empresaId });
    if (result.affected === 0) {
      throw new NotFoundException('Workflow não encontrado');
    }
  }

  async toggleStatus(id: number, empresaId: string): Promise<Workflow> {
    const workflow = await this.findOne(id, empresaId);
    const novoStatus = workflow.status === 'ativo' ? 'pausado' : 'ativo';
    await this.workflowRepo.update({ id, empresaId }, { status: novoStatus as any });
    return await this.findOne(id, empresaId);
  }

  async getStats(empresaId: string) {
    const total = await this.workflowRepo.count({ where: { empresaId } });
    const ativos = await this.workflowRepo.count({ where: { empresaId, status: 'ativo' } });
    const pausados = await this.workflowRepo.count({ where: { empresaId, status: 'pausado' } });

    const workflows = await this.findAll(empresaId);
    const totalExecucoes = workflows.reduce((acc, w) => acc + w.execucoes, 0);
    const totalSucessos = workflows.reduce((acc, w) => acc + w.sucessos, 0);
    const taxaSucesso = totalExecucoes > 0 ? Math.round((totalSucessos / totalExecucoes) * 100) : 0;

    return {
      totalWorkflows: total,
      workflowsAtivos: ativos,
      workflowsPausados: pausados,
      taxaSucessoGeral: taxaSucesso
    };
  }
}

