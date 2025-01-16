import { JSONSchema } from 'objection';
import AutoTimestampModel from './base/AutoTimestampModel.js';
import knex from '@/db/knex.js';

class UserLike extends AutoTimestampModel {
  id!: string;
  userId!: string;
  likedUserId!: string;

  static get tableName(): string {
    return 'user_like';
  }

  static get jsonSchema(): JSONSchema {
    return {
      type: 'object',
      required: ['userId', 'likedUserId'],
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        likedUserId: { type: 'string' },
      },
    };
  }
}

UserLike.knex(knex);

export default UserLike;
