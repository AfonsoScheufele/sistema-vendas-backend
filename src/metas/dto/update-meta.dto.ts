import { PartialType } from '@nestjs/mapped-types';
import { CreateMetaDto } from './create-meta.dto';

export class UpdateMetaDto extends PartialType(CreateMetaDto) {}


