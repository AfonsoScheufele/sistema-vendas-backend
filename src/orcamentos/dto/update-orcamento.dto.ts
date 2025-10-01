import { PartialType } from '@nestjs/mapped-types';
import { CreateOrcamentoDto } from './create-orcamento.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateOrcamentoDto extends PartialType(CreateOrcamentoDto) {
  @IsOptional()
  @IsString()
  @IsIn(['pendente', 'aprovado', 'rejeitado', 'convertido'])
  status?: string;
}