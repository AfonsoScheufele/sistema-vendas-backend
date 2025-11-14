import { PartialType } from '@nestjs/mapped-types';
import { CreateOrcamentoMetaDto } from './create-orcamento-meta.dto';

export class UpdateOrcamentoMetaDto extends PartialType(CreateOrcamentoMetaDto) {}

