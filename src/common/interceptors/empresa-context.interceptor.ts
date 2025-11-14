import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class EmpresaContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const empresaHeader = (request.headers?.['x-empresa-id'] ?? request.headers?.['empresa-id']) as string | undefined;

    request.empresaId = empresaHeader && typeof empresaHeader === 'string' ? empresaHeader : 'default-empresa';

    return next.handle();
  }
}

