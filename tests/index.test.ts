import Redis from 'ioredis';
import { Knex } from 'knex';
import { StartedTestContainer, GenericContainer, Wait } from 'testcontainers';

describe('Dummy', () => {
  it('should success', (done) => {
    done();
  });
});

let postgresContainer: StartedTestContainer;
let redisContainer: StartedTestContainer;
let originalEnv: NodeJS.ProcessEnv;
let knex: Knex;
let redis: Redis;

// Global Setup
before(async () => {
  console.log('Setting up environment');
  originalEnv = process.env;

  // Start test containers
  console.log('Starting PostgreSQL testcontainer');
  postgresContainer = await new GenericContainer('postgres')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: 'test',
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'testpass',
    })
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  console.log('Starting Redis testcontainer');
  redisContainer = await new GenericContainer('redis')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const pgHost = postgresContainer.getHost();
  const pgPort = postgresContainer.getMappedPort(5432);
  process.env.POSTGRES_URI = `postgresql://test:testpass@${pgHost}:${pgPort}/test`;

  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getMappedPort(6379);
  process.env.REDIS_URI = `redis://${redisHost}:${redisPort}`;

  knex = (await import('../src/db/knex.js')).default;
  redis = (await import('../src/utils/redis.js')).default;

  // Run migrations and seeds using the existing knex instance
  await knex.migrate.latest();
  await knex.seed.run();
  console.log('Test environment set up');
});

// Global Teardown
after(async () => {
  // Clean up resources
  console.log('Tearing down...');
  await knex.destroy();
  await redis.quit();
  await postgresContainer.stop();
  await redisContainer.stop();

  process.env = originalEnv;
  console.log('Teardown complete');
});
