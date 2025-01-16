import { expect } from 'chai';
import request from 'supertest';
import { type Express } from 'express';
import Redis from 'ioredis';
import type User from '../../src/db/models/User.js';

describe('Premium purchase service testing', function () {
  this.timeout(60000);

  const defaultTestUser = 'testuser00@example.com';
  const defaultTestPassword = 'testpassw0rd';

  let testUserCookie: string;
  let app: Express;
  let redis: Redis;
  let UserModel: typeof User;

  before(async () => {
    redis = (await import('../../src/utils/redis.js')).default;
    app = (await import('../../src/app/index.js')).default;
    UserModel = (await import('../../src/db/models/User.js')).default;

    // Login as one user to get cookie and persist it for the test
    const res = await request(app)
      .post('/user/login')
      .send({ email: defaultTestUser, password: defaultTestPassword });

    const cookieHeaders = res.headers['set-cookie'];
    testUserCookie = Array.isArray(cookieHeaders)
      ? cookieHeaders.pop()
      : cookieHeaders;
  });

  after(async () => {
    await redis.flushall();
  });

  it('should return unauthorized', async () => {
    await request(app).post('/premium/purchase').expect(401);
  });

  it('should return 422', async () => {
    await request(app)
      .post('/premium/purchase')
      .set('Cookie', testUserCookie)
      .send({ type: 'UNKNOWN' })
      .expect(422);
  });

  it('should switch verified to true', async () => {
    await request(app)
      .post('/premium/purchase')
      .set('Cookie', testUserCookie)
      .send({ type: 'VERIFIED_BADGE' })
      .expect(202);

    const dbUser = await UserModel.query()
      .select('verified')
      .findOne({ email: defaultTestUser });

    expect(dbUser!.verified).to.be.equal(true);
  });

  it('should switch quotaEnabled to false', async () => {
    await request(app)
      .post('/premium/purchase')
      .set('Cookie', testUserCookie)
      .send({ type: 'UNLIMITED_QUOTA' })
      .expect(202);

    const dbUser = await UserModel.query()
      .select('quota_enabled')
      .findOne({ email: defaultTestUser });

    expect(dbUser!.quotaEnabled).to.be.equal(false);
  });
});
