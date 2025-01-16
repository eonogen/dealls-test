import path from 'path';
import { Knex } from 'knex';
import { POSTGRES_URI } from '../constants/env.js';

const migrationDir = path.resolve(process.cwd(), 'migrations');
const seedDir = path.resolve(process.cwd(), 'seeds');

const commonSettings: Knex.Config = {
  client: 'pg',
  connection: POSTGRES_URI,
  migrations: {
    tableName: 'knex_migrations',
    directory: migrationDir,
  },
  seeds: {
    directory: seedDir,
  },
};

const configs: Record<string, Knex.Config> = {
  development: {
    ...commonSettings,
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    ...commonSettings,
    pool: {
      min: 2,
      max: 100,
    },
  },
};

export default configs;
