import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
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

  it('deve fazer login, obter refresh e acessar /auth/me', async () => {
    const cpf = process.env.E2E_CPF || '00000000000';
    const senha = process.env.E2E_SENHA || '123456';

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ cpf, senha })
      .expect(200);

    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.refresh_token).toBeDefined();

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(meRes.body).toHaveProperty('id');

    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: loginRes.body.refresh_token })
      .expect(200);

    expect(refreshRes.body.token).toBeDefined();
    expect(refreshRes.body.refresh_token).toBeDefined();
  });
});
