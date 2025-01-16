import { expect } from 'chai';
import request from 'supertest';
import { type Express } from 'express';
import Redis from 'ioredis';

describe('Matching service testing', function () {
  this.timeout(60000);

  const defaultTestUser = 'testuser00@example.com';
  const defaultTestPassword = 'testpassw0rd';

  let app: Express;
  let testUserCookie: string;
  let redis: Redis;

  before(async () => {
    redis = (await import('../../src/utils/redis.js')).default;
    app = (await import('../../src/app/index.js')).default;

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

  it('should return unauthorized (get profiles)', async () => {
    await request(app).get('/matching').expect(401);
  });

  it('should return unauthorized (user matching)', async () => {
    await request(app).post('/matching/1').send({ like: true }).expect(401);
  });

  let userProfiles;
  it('should return profiles when authenticated', async () => {
    const profilesResponse = await request(app)
      .get('/matching')
      .set('Cookie', testUserCookie)
      .expect(200);

    userProfiles = profilesResponse.body;
  });

  it('should fail to submit a self like', async () => {
    const meResponse = await request(app)
      .get(`/user/me`)
      .set('Cookie', testUserCookie)
      .send({ like: false })
      .expect(200);

    const me = meResponse.body;
    await request(app)
      .post(`/matching/${me.id}`)
      .set('Cookie', testUserCookie)
      .expect(403);
  });

  let user1;
  it('should be able to successfully submit a pass', async () => {
    user1 = userProfiles.pop();
    await request(app)
      .post(`/matching/${user1.id}`)
      .set('Cookie', testUserCookie)
      .send({ like: false })
      .expect(200);
  });

  let user2;
  it('should be able to successfully submit a like', async () => {
    user2 = userProfiles.pop();
    await request(app)
      .post(`/matching/${user2.id}`)
      .set('Cookie', testUserCookie)
      .send({ like: true })
      .expect(200);
  });

  it('should not find passed/liked users in subsequent query', async () => {
    const profilesResponse = await request(app)
      .get('/matching')
      .set('Cookie', testUserCookie)
      .expect(200);

    const userIds = profilesResponse.body.map((u) => u.id);
    expect(userIds).to.not.deep.include(user1.id);
    expect(userIds).to.not.deep.include(user2.id);
  });

  it('should find passed/liked users in subsequent query after cache miss', async () => {
    // Simulate cache miss by clearing keys
    const keys = await redis.keys('uid:*');
    await redis.del(keys);
    const profilesResponse = await request(app)
      .get('/matching')
      .set('Cookie', testUserCookie)
      .expect(200);

    const userIds = profilesResponse.body.map((u) => u.id);
    expect(userIds).to.deep.include(user1.id);
    expect(userIds).to.deep.include(user2.id);
  });
});
