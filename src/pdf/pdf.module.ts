import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from '../common/services/pdf.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}

