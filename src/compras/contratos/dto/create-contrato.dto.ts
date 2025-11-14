import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { CONTRATO_STATUS, CONTRATO_TIPOS, ContratoStatus, ContratoTipo } from '../contrato.interface';

export class CreateContratoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  numero!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fornecedor!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @IsNumber()
  @IsPositive()
  valor!: number;

  @IsDateString()
  dataInicio!: string;

  @IsDateString()
  dataFim!: string;

  @IsEnum(CONTRATO_STATUS)
  status!: ContratoStatus;

  @IsEnum(CONTRATO_TIPOS)
  tipo!: ContratoTipo;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  responsavel!: string;

  @IsOptional()
  @IsString()
  empresaId?: string;
}
