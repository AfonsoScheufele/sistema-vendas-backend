import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscalServicoEntity } from './nota-fiscal-servico.entity';
import { CreateNfseDto } from './dto/create-nfse.dto';
import { Servico } from '../servicos/servico.entity';
import { Cliente } from '../clientes/cliente.entity';

@Injectable()
export class NfseService {
  constructor(
    @InjectRepository(NotaFiscalServicoEntity)
    private nfseRepo: Repository<NotaFiscalServicoEntity>,
    @InjectRepository(Servico)
    private servicoRepo: Repository<Servico>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async emitir(createNfseDto: CreateNfseDto, empresaId: string): Promise<NotaFiscalServicoEntity> {
    const { clienteId, servicoId, valorServico, issRetido } = createNfseDto;

    const servico = await this.servicoRepo.findOne({ where: { id: servicoId, empresaId } });
    if (!servico) throw new NotFoundException('Serviço não encontrado.');

    const cliente = await this.clienteRepo.findOne({ where: { id: clienteId, empresaId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado.');

    // Mock de numeração sequencial
    const lastNfse = await this.nfseRepo.findOne({ where: { empresaId }, order: { id: 'DESC' } });
    const nextNum = lastNfse ? parseInt(lastNfse.numero) + 1 : 1;

    const aliquotaIss = servico.aliquotaIss || 0;
    const valorIss = (valorServico * aliquotaIss) / 100;

    const nfse = this.nfseRepo.create({
      empresaId,
      numero: nextNum.toString(),
      serie: '1',
      clienteId,
      servicoId,
      valorServico,
      aliquotaIss,
      valorIss,
      issRetido: issRetido || false,
      descricaoServico: createNfseDto.descricaoServico || servico.descricao || servico.nome,
      observacoes: createNfseDto.observacoes,
      status: 'emitida',
      xml: '<xml>Mock XML NFS-e</xml>', // TODO: Gerar XML real
    });

    return this.nfseRepo.save(nfse);
  }

  async listar(empresaId: string): Promise<NotaFiscalServicoEntity[]> {
    return this.nfseRepo.find({
      where: { empresaId },
      relations: ['cliente', 'servico'],
      order: { dataEmissao: 'DESC' },
    });
  }

  async obterPorId(id: number, empresaId: string): Promise<NotaFiscalServicoEntity> {
    const nfse = await this.nfseRepo.findOne({
      where: { id, empresaId },
      relations: ['cliente', 'servico'],
    });
    if (!nfse) throw new NotFoundException('NFS-e não encontrada.');
    return nfse;
  }

  async cancelar(id: number, empresaId: string): Promise<NotaFiscalServicoEntity> {
    const nfse = await this.obterPorId(id, empresaId);
    if (nfse.status === 'cancelada') throw new BadRequestException('NFS-e já cancelada.');

    nfse.status = 'cancelada';
    return this.nfseRepo.save(nfse);
  }

  async gerarPdf(id: number, empresaId: string): Promise<Buffer> {
    // Mock PDF Generation
    const PDFDocument = require('pdfkit');
    const nfse = await this.obterPorId(id, empresaId);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        
        doc.fontSize(20).text(`NFS-e Nº ${nfse.numero}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Prestador: Minha Empresa`);
        doc.text(`Tomador: ${nfse.cliente?.nome}`);
        doc.text(`Serviço: ${nfse.descricaoServico}`);
        doc.text(`Valor: R$ ${Number(nfse.valorServico).toFixed(2)}`);
        doc.text(`ISS: R$ ${Number(nfse.valorIss).toFixed(2)}`);
        doc.end();
    });
  }
}
