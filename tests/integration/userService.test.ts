import { expect } from 'chai';
import request from 'supertest';
import { type Express } from 'express';
import type User from '../../src/db/models/User.js';

describe('User service testing', function () {
  this.timeout(60000);

  const testUser = {
    email: 'testuser@example.com',
    password: 'lalala',
    fullName: 'Test User',
  };

  let app: Express;
  let UserModel: typeof User;

  before(async () => {
    app = (await import('../../src/app/index.js')).default;
    UserModel = (await import('../../src/db/models/User.js')).default;
  });

  it('should return 422 (validation errors)', async () => {
    await request(app)
      .post('/user/register')
      .send({ email: 'bademail', password: 'short' })
      .expect(422);
  });

  it('should register user', async () => {
    const registerResponse = await request(app)
      .post('/user/register')
      .send(testUser)
      .expect(200);

    expect(registerResponse.body).to.deep.equal({
      message: 'Registration successful',
    });

    const dbUser = await UserModel.query().findOne({ email: testUser.email });
    expect(dbUser).contains({
      email: testUser.email,
      fullName: testUser.fullName,
    });
  });

  it('should return 401 (bad credentials)', async () => {
    await request(app)
      .post('/user/login')
      .send({ email: 'bad@email.co', password: 'wrongpassword' })
      .expect(401);
  });

  let cookies: string;
  it('should successfully login with valid credentials', async () => {
    const loginResponse = await request(app)
      .post('/user/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(loginResponse.body).to.contain({
      message: 'Logged in successfully',
    });
    cookies = loginResponse.headers['set-cookie'];
    expect(cookies).to.be.an('array').length.above(0);
  });

  it('should return user profile with valid login session', async () => {
    const meResponse = await request(app)
      .get('/user/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(meResponse.body).contains({
      email: testUser.email,
      fullName: testUser.fullName,
    });
  });

  it('should deny access to /me without session', async () => {
    await request(app).get('/user/me').expect(401);
  });

  it('should deny profile update without session', async () => {
    await request(app).post('/user/me').send({ bio: 'a' }).expect(401);
  });

  it('should update profile', async () => {
    const bio = 'I am me';
    await request(app)
      .post('/user/me')
      .send({ bio })
      .set('Cookie', cookies)
      .expect(200);

    const dbUser = await UserModel.query()
      .select('bio')
      .findOne({ email: testUser.email });

    expect(dbUser!.bio).to.equal(bio);
  });
});
