import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  tipoAcao?: string;
  entidade?: string;
  descricao?: string;
  ignorar?: boolean;
}

export const Audit = (options: AuditOptions = {}) => SetMetadata(AUDIT_KEY, options);

