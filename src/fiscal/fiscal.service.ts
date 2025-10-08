import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Injectable()
export class FiscalService {
  constructor(
    @InjectRepository(NotaFiscal)
    private notaFiscalRepo: Repository<NotaFiscal>,
  ) {}

  private gerarChaveAcesso(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000000);
    return `${timestamp}${random}`.padStart(44, '0');
  }

  private gerarNumeroNota(): string {
    const timestamp = Date.now();
    return timestamp.toString().slice(-9);
  }

  async criarNotaFiscal(createNotaFiscalDto: any): Promise<NotaFiscal> {
    const notaFiscal = this.notaFiscalRepo.create({
      ...createNotaFiscalDto,
      numero: this.gerarNumeroNota(),
      chave: this.gerarChaveAcesso(),
      status: 'rascunho',
    });

    return await this.notaFiscalRepo.save(notaFiscal) as unknown as NotaFiscal;
  }

  async listarNotasFiscais(filtros?: any): Promise<NotaFiscal[]> {
    const query = this.notaFiscalRepo.createQueryBuilder('nota');

    if (filtros?.status) {
      query.where('nota.status = :status', { status: filtros.status });
    }

    if (filtros?.tipo) {
      query.andWhere('nota.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('nota.dataEmissao BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query
      .orderBy('nota.dataEmissao', 'DESC')
      .getMany();
  }

  async obterNotaFiscal(id: number): Promise<NotaFiscal> {
    const notaFiscal = await this.notaFiscalRepo.findOne({ where: { id } });
    
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    
    return notaFiscal;
  }

  async emitirNotaFiscal(id: number): Promise<NotaFiscal> {
    const notaFiscal = await this.obterNotaFiscal(id);
    
    if (notaFiscal.status !== 'rascunho') {
      throw new Error('Apenas notas em rascunho podem ser emitidas');
    }

    notaFiscal.status = 'emitida';
    notaFiscal.dataEmissao = new Date();
    
    return await this.notaFiscalRepo.save(notaFiscal) as unknown as NotaFiscal;
  }

  async autorizarNotaFiscal(id: number): Promise<NotaFiscal> {
    const notaFiscal = await this.obterNotaFiscal(id);
    
    if (notaFiscal.status !== 'emitida') {
      throw new Error('Apenas notas emitidas podem ser autorizadas');
    }

    notaFiscal.status = 'autorizada';
    
    return await this.notaFiscalRepo.save(notaFiscal) as unknown as NotaFiscal;
  }

  async cancelarNotaFiscal(id: number, motivo: string): Promise<NotaFiscal> {
    const notaFiscal = await this.obterNotaFiscal(id);
    
    if (notaFiscal.status === 'cancelada') {
      throw new Error('Nota fiscal já está cancelada');
    }

    notaFiscal.status = 'cancelada';
    notaFiscal.observacoes = `${notaFiscal.observacoes || ''}\nCancelada em ${new Date().toISOString()}: ${motivo}`.trim();
    
    return await this.notaFiscalRepo.save(notaFiscal) as unknown as NotaFiscal;
  }

  async obterResumoFiscal(): Promise<any> {
    const [
      totalNotas,
      notasAutorizadas,
      notasPendentes,
      notasCanceladas,
      valorTotal,
      notasHoje
    ] = await Promise.all([
      this.notaFiscalRepo.count(),
      this.notaFiscalRepo.count({ where: { status: 'autorizada' } }),
      this.notaFiscalRepo.count({ where: { status: 'emitida' } }),
      this.notaFiscalRepo.count({ where: { status: 'cancelada' } }),
      this.notaFiscalRepo
        .createQueryBuilder('nota')
        .select('SUM(nota.valorTotal)', 'total')
        .where('nota.status = :status', { status: 'autorizada' })
        .getRawOne(),
      this.notaFiscalRepo.count({
        where: {
          dataEmissao: new Date(new Date().setHours(0, 0, 0, 0)) as any,
        },
      }),
    ]);

    return {
      totalNotas,
      notasAutorizadas,
      notasPendentes,
      notasCanceladas,
      valorTotal: Number(valorTotal?.total || 0),
      notasHoje,
    };
  }

  async gerarXML(id: number): Promise<string> {
    const notaFiscal = await this.obterNotaFiscal(id);
    
    // Aqui você implementaria a geração real do XML
    // Por enquanto, retornamos um XML mock
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe Id="NFe${notaFiscal.chave}">
      <ide>
        <cUF>35</cUF>
        <cNF>${notaFiscal.numero}</cNF>
        <natOp>${notaFiscal.naturezaOperacao}</natOp>
        <mod>55</mod>
        <serie>${notaFiscal.serie}</serie>
        <nNF>${notaFiscal.numero}</nNF>
        <dhEmi>${notaFiscal.dataEmissao.toISOString()}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>Empresa Exemplo</xNome>
        <xFant>Fantasia</xFant>
        <enderEmit>
          <xLgr>Rua Exemplo</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01000000</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderEmit>
        <IE>123456789</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>${notaFiscal.cnpj}</CNPJ>
        <xNome>${notaFiscal.cliente}</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>${notaFiscal.valorTotal}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

    // Salvar XML na nota fiscal
    notaFiscal.xml = xml;
    await this.notaFiscalRepo.save(notaFiscal);

    return xml;
  }

  async gerarPDF(id: number): Promise<string> {
    const notaFiscal = await this.obterNotaFiscal(id);
    
    // Aqui você implementaria a geração real do PDF
    // Por enquanto, retornamos um PDF mock (base64)
    const pdfContent = `PDF da Nota Fiscal ${notaFiscal.numero} - ${notaFiscal.cliente}`;
    
    // Salvar PDF na nota fiscal
    notaFiscal.pdf = pdfContent;
    await this.notaFiscalRepo.save(notaFiscal);

    return pdfContent;
  }
}

