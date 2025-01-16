import dotenv from 'dotenv';

dotenv.config();

export const { REDIS_URI, POSTGRES_URI } = process.env;
