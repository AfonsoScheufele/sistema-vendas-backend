import { PartialType } from '@nestjs/mapped-types';
import { CreateFornecedorDto } from './create-fornecedor.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateFornecedorDto extends PartialType(CreateFornecedorDto) {
  @IsOptional()
  @IsEnum(['ativo', 'inativo', 'bloqueado'], { message: 'Status deve ser ativo, inativo ou bloqueado' })
  status?: 'ativo' | 'inativo' | 'bloqueado';
}
