import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Fluxos centrais E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('falha ao acessar /pedidos sem x-empresa-id', async () => {
    const cpf = process.env.E2E_CPF || '00000000000';
    const senha = process.env.E2E_SENHA || '123456';

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, senha })
      .expect(200);

    const token = loginRes.body.token as string;

    await request(app.getHttpServer())
      .get('/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('login, obtém empresas e acessa /pedidos e /orcamentos com x-empresa-id', async () => {
    const cpf = process.env.E2E_CPF || '00000000000';
    const senha = process.env.E2E_SENHA || '123456';

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, senha })
      .expect(200);

    const token = loginRes.body.token as string;
    const empresas = (loginRes.body.empresas || []) as Array<{ id: string; nome: string }>;
    expect(token).toBeDefined();
    expect(Array.isArray(empresas)).toBe(true);

    const empresaId = empresas[0]?.id || 'default-empresa';

    // Pedidos - listar
    await request(app.getHttpServer())
      .get('/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .set('x-empresa-id', empresaId)
      .expect(200);

    // Orçamentos - listar
    await request(app.getHttpServer())
      .get('/orcamentos')
      .set('Authorization', `Bearer ${token}`)
      .set('x-empresa-id', empresaId)
      .expect(200);
  });

  it('deve validar token JWT inválido', async () => {
    await request(app.getHttpServer())
      .get('/pedidos')
      .set('Authorization', 'Bearer token-invalido')
      .set('x-empresa-id', 'empresa-id')
      .expect(401);
  });

  it('deve validar refresh token rotation', async () => {
    const cpf = process.env.E2E_CPF || '00000000000';
    const senha = process.env.E2E_SENHA || '123456';

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, senha })
      .expect(200);

    const refreshToken = loginRes.body.refreshToken as string;
    expect(refreshToken).toBeDefined();

    // Primeiro refresh
    const refreshRes1 = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const newRefreshToken1 = refreshRes1.body.refreshToken as string;
    expect(newRefreshToken1).toBeDefined();
    expect(newRefreshToken1).not.toBe(refreshToken);

    // Segundo refresh com o novo token
    const refreshRes2 = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: newRefreshToken1 })
      .expect(200);

    expect(refreshRes2.body.refreshToken).toBeDefined();

    // Token antigo deve estar inválido
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('deve acessar /auth/me com token válido', async () => {
    const cpf = process.env.E2E_CPF || '00000000000';
    const senha = process.env.E2E_SENHA || '123456';

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, senha })
      .expect(200);

    const token = loginRes.body.token as string;

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toHaveProperty('id');
    expect(meRes.body).toHaveProperty('cpf');
  });
});
