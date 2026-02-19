import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class ItemDevolucaoDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  quantidade: number;

  @IsString()
  @IsOptional()
  condicao?: string;
}

export class CreateDevolucaoDto {
  @IsNumber()
  pedidoId: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsArray()
  @IsNotEmpty()
  itens: ItemDevolucaoDto[];

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class AprovarDevolucaoDto {
  @IsString()
  @IsEnum(['aprovada', 'rejeitada'])
  status: string;

  @IsString()
  @IsOptional()
  tipoReembolso?: string;

  @IsNumber()
  @IsOptional()
  valorReembolso?: number;
  
  @IsOptional()
  reentradaEstoque?: boolean;
}
