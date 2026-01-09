import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, In } from 'typeorm';
import { BackupEntity } from './backup.entity';
import { BackupConfigEntity } from './backup-config.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Produto } from '../produtos/produto.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { ComissaoVendedorEntity } from '../comissoes/comissao-vendedor.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmpresaEntity } from '../empresas/empresa.entity';
import { Usuario } from '../auth/usuario.entity';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private intervalId: NodeJS.Timeout | null = null;
  private ultimosBackups: Map<string, Date> = new Map();

  constructor(
    @InjectRepository(BackupEntity)
    private readonly backupRepository: Repository<BackupEntity>,
    @InjectRepository(BackupConfigEntity)
    private readonly configRepository: Repository<BackupConfigEntity>,
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {
    this.ensureBackupDirectory();
  }

  async onModuleInit() {
    this.iniciarScheduler();
  }

  private iniciarScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      await this.verificarBackupsAutomaticos();
    }, 60000);
  }

  private async verificarBackupsAutomaticos() {
    try {
      const empresas = await this.empresaRepository.find();
      
      for (const empresa of empresas) {
        const config = await this.obterConfiguracao(empresa.id);
        
        if (!config.backupAutomatico) {
          continue;
        }

        const agora = new Date();
        const [horas, minutos] = config.horario.split(':').map(Number);
        const horarioBackup = new Date();
        horarioBackup.setHours(horas, minutos, 0, 0);

        const ultimoBackup = this.ultimosBackups.get(empresa.id);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (ultimoBackup && ultimoBackup >= hoje) {
          continue;
        }

        const diferencaMinutos = (agora.getTime() - horarioBackup.getTime()) / (1000 * 60);
        
        if (diferencaMinutos >= 0 && diferencaMinutos <= 5) {
          await this.executarBackupAutomatico(empresa.id);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar backups automáticos:', error);
    }
  }

  private async executarBackupAutomatico(empresaId: string) {
    try {
      const backup = await this.criarBackup(empresaId, 'automatico');
      this.ultimosBackups.set(empresaId, new Date());

      const usuarioEmpresaRepo = this.dataSource.getRepository(UsuarioEmpresaEntity);
      const vinculos = await usuarioEmpresaRepo.find({
        where: { empresaId },
        relations: ['usuario'],
      });


      if (vinculos.length === 0) {
        console.warn(`[Backup Automático] Nenhum usuário encontrado para empresa ${empresaId}`);
      }

      let notificacoesCriadas = 0;
      
      if (vinculos.length === 0) {
        console.warn(`[Backup Automático] Nenhum vínculo encontrado. Tentando buscar usuários diretamente...`);
        const usuarioRepo = this.dataSource.getRepository(Usuario);
        const usuarios = await usuarioRepo.find();
        
        for (const usuario of usuarios) {
          try {
            const tamanhoFormatado = backup.tamanhoBytes ? `${(backup.tamanhoBytes / 1024).toFixed(2)} KB` : 'N/A';
            const notificacao = await this.notificationsService.criarNotificacao(
              usuario.id,
              'Backup Automático Criado',
              `Um backup automático foi criado com sucesso em ${new Date().toLocaleString('pt-BR')}. Nome: ${backup.nome}. Tamanho: ${tamanhoFormatado}. ID: ${backup.id}`,
              'success',
              'normal',
            );
            notificacoesCriadas++;
          } catch (notifError) {
            console.error(`[Backup Automático] Erro ao criar notificação para usuário ${usuario.id}:`, notifError);
          }
        }
      } else {
        for (const vinculo of vinculos) {
          if (vinculo.usuario && vinculo.usuario.id) {
            try {
              const tamanhoFormatado = backup.tamanhoBytes ? `${(backup.tamanhoBytes / 1024).toFixed(2)} KB` : 'N/A';
              const notificacao = await this.notificationsService.criarNotificacao(
                vinculo.usuario.id,
                'Backup Automático Criado',
                `Um backup automático foi criado com sucesso em ${new Date().toLocaleString('pt-BR')}. Nome: ${backup.nome}. Tamanho: ${tamanhoFormatado}. ID: ${backup.id}`,
                'success',
                'normal',
              );
              notificacoesCriadas++;
            } catch (notifError) {
              console.error(`[Backup Automático] Erro ao criar notificação para usuário ${vinculo.usuario.id}:`, notifError);
            }
          } else {
            console.warn(`[Backup Automático] Vínculo sem usuário válido:`, vinculo);
          }
        }
      }

    } catch (error) {
      console.error(`[Backup Automático] Erro ao criar backup para empresa ${empresaId}:`, error);
    }
  }

  private async ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      await mkdir(this.backupDir, { recursive: true });
    }
  }

  async obterConfiguracao(empresaId: string): Promise<BackupConfigEntity> {
    let config = await this.configRepository.findOne({
      where: { empresaId },
    });

    if (!config) {
      config = this.configRepository.create({
        empresaId,
        backupAutomatico: true,
        frequencia: 'diario',
        horario: '02:00:00',
        diasRetencao: 30,
      });
      await this.configRepository.save(config);
    }

    return config;
  }

  async atualizarConfiguracao(
    empresaId: string,
    dados: Partial<BackupConfigEntity>,
  ): Promise<BackupConfigEntity> {
    let config = await this.configRepository.findOne({
      where: { empresaId },
    });

    if (!config) {
      config = this.configRepository.create({
        empresaId,
        ...dados,
      });
    } else {
      Object.assign(config, dados);
    }

    return this.configRepository.save(config);
  }

  async criarBackup(empresaId: string, tipo: 'manual' | 'automatico' = 'manual'): Promise<BackupEntity> {
    const backup = this.backupRepository.create({
      empresaId,
      nome: `Backup ${tipo === 'manual' ? 'Manual' : 'Automático'} - ${new Date().toLocaleString('pt-BR')}`,
      descricao: `Backup criado em ${new Date().toLocaleString('pt-BR')}`,
      tipo,
      status: 'em_andamento',
    });

    await this.backupRepository.save(backup);

    try {
      const dados = await this.exportarDados(empresaId);
      const nomeArquivo = `backup_${empresaId}_${backup.id}_${Date.now()}.json`;
      const caminhoArquivo = path.join(this.backupDir, nomeArquivo);

      await writeFile(caminhoArquivo, JSON.stringify(dados, null, 2), 'utf-8');
      const stats = fs.statSync(caminhoArquivo);

      backup.status = 'concluido';
      backup.caminhoArquivo = caminhoArquivo;
      backup.tamanhoBytes = stats.size;
      backup.dadosBackup = dados;

      await this.backupRepository.save(backup);
      await this.limparBackupsAntigos(empresaId);

      return backup;
    } catch (error) {
      backup.status = 'falhou';
      backup.erro = error.message;
      await this.backupRepository.save(backup);
      throw error;
    }
  }

  private async exportarDados(empresaId: string): Promise<any> {
    const dados: any = {
      empresaId,
      dataExportacao: new Date().toISOString(),
      versao: '1.0',
      dados: {},
    };

    try {
      const clienteRepo = this.dataSource.getRepository(Cliente);
      dados.dados['Cliente'] = await clienteRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar Cliente:', error.message);
    }

    try {
      const produtoRepo = this.dataSource.getRepository(Produto);
      dados.dados['Produto'] = await produtoRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar Produto:', error.message);
    }

    try {
      const pedidoRepo = this.dataSource.getRepository(Pedido);
      dados.dados['Pedido'] = await pedidoRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar Pedido:', error.message);
    }

    try {
      const itemPedidoRepo = this.dataSource.getRepository(ItemPedido);
      const pedidos = await this.dataSource.getRepository(Pedido).find({ where: { empresaId } });
      const pedidoIds = pedidos.map(p => p.id);
      if (pedidoIds.length > 0) {
        dados.dados['ItemPedido'] = await itemPedidoRepo.find({ where: { pedidoId: In(pedidoIds) } });
      }
    } catch (error) {
      console.warn('Erro ao exportar ItemPedido:', error.message);
    }

    try {
      const orcamentoRepo = this.dataSource.getRepository(Orcamento);
      dados.dados['Orcamento'] = await orcamentoRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar Orcamento:', error.message);
    }

    try {
      const comissaoRepo = this.dataSource.getRepository(ComissaoEntity);
      dados.dados['ComissaoEntity'] = await comissaoRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar ComissaoEntity:', error.message);
    }

    try {
      const comissaoVendedorRepo = this.dataSource.getRepository(ComissaoVendedorEntity);
      dados.dados['ComissaoVendedorEntity'] = await comissaoVendedorRepo.find({ where: { empresaId } });
    } catch (error) {
      console.warn('Erro ao exportar ComissaoVendedorEntity:', error.message);
    }

    return dados;
  }

  async listarBackups(empresaId: string): Promise<BackupEntity[]> {
    return this.backupRepository.find({
      where: { empresaId },
      order: { createdAt: 'DESC' },
    });
  }

  async obterBackup(id: string, empresaId: string): Promise<BackupEntity> {
    const backup = await this.backupRepository.findOne({
      where: { id, empresaId },
    });

    if (!backup) {
      throw new NotFoundException('Backup não encontrado');
    }

    return backup;
  }

  async restaurarBackup(id: string, empresaId: string): Promise<void> {
    const backup = await this.obterBackup(id, empresaId);

    if (backup.status !== 'concluido') {
      throw new Error('Backup não pode ser restaurado. Status: ' + backup.status);
    }

    if (!backup.caminhoArquivo || !fs.existsSync(backup.caminhoArquivo)) {
      throw new Error('Arquivo de backup não encontrado');
    }

    const dados = JSON.parse(await readFile(backup.caminhoArquivo, 'utf-8'));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dados.dados['Cliente'] && Array.isArray(dados.dados['Cliente'])) {
        const repo = queryRunner.manager.getRepository(Cliente);
        for (const registro of dados.dados['Cliente']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      if (dados.dados['Produto'] && Array.isArray(dados.dados['Produto'])) {
        const repo = queryRunner.manager.getRepository(Produto);
        for (const registro of dados.dados['Produto']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      if (dados.dados['Pedido'] && Array.isArray(dados.dados['Pedido'])) {
        const repo = queryRunner.manager.getRepository(Pedido);
        for (const registro of dados.dados['Pedido']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      if (dados.dados['ItemPedido'] && Array.isArray(dados.dados['ItemPedido'])) {
        const repo = queryRunner.manager.getRepository(ItemPedido);
        for (const registro of dados.dados['ItemPedido']) {
          await repo.save(registro);
        }
      }

      if (dados.dados['Orcamento'] && Array.isArray(dados.dados['Orcamento'])) {
        const repo = queryRunner.manager.getRepository(Orcamento);
        for (const registro of dados.dados['Orcamento']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      if (dados.dados['ComissaoEntity'] && Array.isArray(dados.dados['ComissaoEntity'])) {
        const repo = queryRunner.manager.getRepository(ComissaoEntity);
        for (const registro of dados.dados['ComissaoEntity']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      if (dados.dados['ComissaoVendedorEntity'] && Array.isArray(dados.dados['ComissaoVendedorEntity'])) {
        const repo = queryRunner.manager.getRepository(ComissaoVendedorEntity);
        for (const registro of dados.dados['ComissaoVendedorEntity']) {
          if (registro.empresaId === empresaId) {
            await repo.save(registro);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async excluirBackup(id: string, empresaId: string): Promise<void> {
    const backup = await this.obterBackup(id, empresaId);

    if (backup.caminhoArquivo && fs.existsSync(backup.caminhoArquivo)) {
      await unlink(backup.caminhoArquivo);
    }

    const backupNome = backup.nome;
    const backupId = backup.id;

    await this.backupRepository.remove(backup);

    try {
      const removidasPorId = await this.notificationsService.removerNotificacoesPorBackupId(backupId);
      const removidasPorNome = await this.notificationsService.removerNotificacoesPorMensagem(backupNome);
      const totalRemovidas = removidasPorId + removidasPorNome;
    } catch (error) {
      console.warn(`[Backup] Erro ao remover notificações do backup ${id}:`, error);
    }
  }

  private async limparBackupsAntigos(empresaId: string): Promise<void> {
    const config = await this.obterConfiguracao(empresaId);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - config.diasRetencao);

    const backupsAntigos = await this.backupRepository.find({
      where: {
        empresaId,
        createdAt: LessThan(dataLimite),
      },
    });

    for (const backup of backupsAntigos) {
      if (backup.caminhoArquivo && fs.existsSync(backup.caminhoArquivo)) {
        await unlink(backup.caminhoArquivo);
      }
      await this.backupRepository.remove(backup);
    }
  }

  async downloadBackup(id: string, empresaId: string): Promise<Buffer> {
    const backup = await this.obterBackup(id, empresaId);

    if (!backup.caminhoArquivo || !fs.existsSync(backup.caminhoArquivo)) {
      throw new NotFoundException('Arquivo de backup não encontrado');
    }

    return readFile(backup.caminhoArquivo);
  }
}

