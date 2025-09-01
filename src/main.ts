import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS com configuração
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Validação automática dos DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Porta do servidor
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Servidor rodando em http://localhost:${port}`);
}

bootstrap();
