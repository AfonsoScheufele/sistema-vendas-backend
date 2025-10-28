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

  async findAll(): Promise<Workflow[]> {
    return await this.workflowRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException('Workflow não encontrado');
    }
    return workflow;
  }

  async create(data: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflowRepo.create(data);
    return await this.workflowRepo.save(workflow);
  }

  async update(id: number, data: Partial<Workflow>): Promise<Workflow> {
    await this.workflowRepo.update(id, data);
    return await this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.workflowRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Workflow não encontrado');
    }
  }

  async toggleStatus(id: number): Promise<Workflow> {
    const workflow = await this.findOne(id);
    const novoStatus = workflow.status === 'ativo' ? 'pausado' : 'ativo';
    await this.workflowRepo.update(id, { status: novoStatus as any });
    return await this.findOne(id);
  }

  async getStats() {
    const total = await this.workflowRepo.count();
    const ativos = await this.workflowRepo.count({ where: { status: 'ativo' } });
    const pausados = await this.workflowRepo.count({ where: { status: 'pausado' } });
    
    const workflows = await this.findAll();
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

