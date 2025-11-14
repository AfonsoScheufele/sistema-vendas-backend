import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusPagar } from '../conta-pagar.interface';

export class CreateContaPagarDto {
  @IsNotEmpty()
  @IsString()
  titulo!: string;

  @IsNotEmpty()
  @IsString()
  fornecedor!: string;

  @IsNotEmpty()
  @IsNumber()
  valor!: number;

  @IsOptional()
  @IsNumber()
  valorPago?: number;

  @IsNotEmpty()
  @IsDateString()
  emissao!: string;

  @IsNotEmpty()
  @IsDateString()
  vencimento!: string;

  @IsOptional()
  @IsDateString()
  pagamento?: string;

  @IsOptional()
  @IsEnum(['aberta', 'programada', 'paga', 'atrasada'])
  status?: StatusPagar;

  @IsOptional()
  @IsString()
  centroCusto?: string;

  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @IsOptional()
  @IsString()
  responsavel?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
