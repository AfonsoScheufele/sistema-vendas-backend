import { SetMetadata } from '@nestjs/common';

export const EmpresaPermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

