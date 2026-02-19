import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';

export class CreateNfseDto {
  @IsNumber()
  clienteId: number;

  @IsNumber()
  servicoId: number;

  @IsNumber()
  @Min(0)
  valorServico: number;

  @IsString()
  @IsOptional()
  descricaoServico?: string;

  @IsBoolean()
  @IsOptional()
  issRetido?: boolean;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
