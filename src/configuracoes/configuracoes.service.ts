import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracaoEmpresaEntity } from './configuracao-empresa.entity';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracoesService implements OnModuleInit {
  constructor(
    @InjectRepository(ConfiguracaoEmpresaEntity)
    private readonly configRepository: Repository<ConfiguracaoEmpresaEntity>,
  ) {}

  async onModuleInit() {
    // Seed inicial para empresas existentes
    const empresas = ['default-empresa', 'empresa-sul'];
    for (const empresaId of empresas) {
      const existe = await this.configRepository.findOne({ where: { empresaId } });
      if (!existe) {
        const config = this.configRepository.create({
          empresaId,
          nomeFantasia: empresaId === 'default-empresa' ? 'Axora Matriz' : 'Axora Regional Sul',
          razaoSocial: empresaId === 'default-empresa' ? 'Axora Matriz Ltda' : 'Axora Regional Sul Ltda',
          cnpj: empresaId === 'default-empresa' ? '12.345.678/0001-90' : '98.765.432/0001-10',
        });
        await this.configRepository.save(config);
      }
    }
  }

  async obterConfiguracao(empresaId: string): Promise<ConfiguracaoEmpresaEntity> {
    let config = await this.configRepository.findOne({ where: { empresaId } });
    
    if (!config) {
      // Criar configuração padrão se não existir
      config = this.configRepository.create({ empresaId });
      config = await this.configRepository.save(config);
    }
    
    return config;
  }

  async atualizarConfiguracao(
    empresaId: string,
    dto: UpdateConfiguracaoDto,
  ): Promise<ConfiguracaoEmpresaEntity> {
    let config = await this.configRepository.findOne({ where: { empresaId } });
    
    if (!config) {
      config = this.configRepository.create({ empresaId });
    }
    
    Object.assign(config, dto);
    return await this.configRepository.save(config);
  }

  async obterConfiguracaoResumida(empresaId: string) {
    const config = await this.obterConfiguracao(empresaId);
    return {
      empresa: {
        nomeFantasia: config.nomeFantasia,
        razaoSocial: config.razaoSocial,
        cnpj: config.cnpj,
        email: config.email,
        telefone: config.telefone,
        endereco: config.endereco,
        cidade: config.cidade,
        estado: config.estado,
        cep: config.cep,
      },
      negocio: {
        moeda: config.moeda,
        locale: config.locale,
        timezone: config.timezone,
        formatoData: config.formatoData,
        formatoHora: config.formatoHora,
      },
      notificacoes: {
        notificacoesEmail: config.notificacoesEmail,
        notificacoesSistema: config.notificacoesSistema,
        alertasVencimento: config.alertasVencimento,
        diasAlertaVencimento: config.diasAlertaVencimento,
        alertasEstoque: config.alertasEstoque,
        estoqueMinimoAlerta: config.estoqueMinimoAlerta,
      },
      integracao: {
        integracaoERP: config.integracaoERP,
        integracaoEcommerce: config.integracaoEcommerce,
        webhookUrl: config.webhookUrl,
      },
      seguranca: {
        diasExpiracaoSenha: config.diasExpiracaoSenha,
        exigirSenhaForte: config.exigirSenhaForte,
        tentativasLoginMaximas: config.tentativasLoginMaximas,
        tempoBloqueioMinutos: config.tempoBloqueioMinutos,
      },
      backup: {
        backupAutomatico: config.backupAutomatico,
        frequenciaBackup: config.frequenciaBackup,
        diasRetencaoBackup: config.diasRetencaoBackup,
      },
      relatorios: {
        relatoriosAutomaticos: config.relatoriosAutomaticos,
        frequenciaRelatorios: config.frequenciaRelatorios,
        emailsRelatorios: config.emailsRelatorios,
      },
    };
  }
}

