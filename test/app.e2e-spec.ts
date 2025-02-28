import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/debtor/registration (POST)', async () => {
    return await request(app.getHttpServer())
      .post('/api/debtor/registration')
      .send({
        debtor_nik: '5101010',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              wallet_address: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
            }),
            message: 'Debtor registration success.',
          }),
        );
      });
  });
});
