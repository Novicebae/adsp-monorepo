import express = require('express');
import { It, Mock } from 'moq.ts';
import * as request from 'supertest';
import { TenantEntity } from '../models';
import { TenantRepository } from '../repository';
import { createTenantRouter } from './tenant';

describe('Service Option Router', () => {
  const app = express();
  const mockRepo = new Mock<TenantRepository>();
  app.use(
    createTenantRouter({
      tenantRepository: mockRepo.object(),
      eventService: null,
      services: null,
    })
  );

  describe('GET /issuers', () => {
    it('returns returns a 401', async () => {
      mockRepo.setup((inst) => inst.issuers()).returns(Promise.resolve([]));
      const res = await request(app).get('/issuers');
      expect(res.statusCode).toBe(401);
    });

    it.skip('returns returns a 200', async () => {
      mockRepo.setup((inst) => inst.issuers()).returns(Promise.resolve([]));
      const res = await request(app).get('/issuers');
      expect(res.statusCode).toBe(200);
    });
  });
});
