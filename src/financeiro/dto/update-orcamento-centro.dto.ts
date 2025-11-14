import { PartialType } from '@nestjs/mapped-types';
import { CreateOrcamentoCentroDto } from './create-orcamento-centro.dto';

export class UpdateOrcamentoCentroDto extends PartialType(CreateOrcamentoCentroDto) {}

