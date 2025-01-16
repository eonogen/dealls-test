import Knex from 'knex';
import configs from './configs.js';

export const config = configs[process.env.NODE_ENV || 'development'];

export default Knex(config);
