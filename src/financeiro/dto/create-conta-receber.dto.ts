import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { StatusReceber } from '../conta-receber.interface';

export class CreateContaReceberDto {
  @IsNotEmpty()
  @IsString()
  titulo!: string;

  @IsNotEmpty()
  @IsString()
  cliente!: string;

  @IsOptional()
  @IsNumber()
  clienteId?: number;

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
  @IsEnum(['aberta', 'vencida', 'recebida', 'negociada'])
  status?: StatusReceber;

  @IsOptional()
  @IsString()
  categoria?: string;

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
