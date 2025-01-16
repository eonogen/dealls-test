import { JSONSchema, Model } from 'objection';
import AutoTimestampModel from './base/AutoTimestampModel.js';
import knex from '@/db/knex.js';
import User from './User.js';

class Purchase extends AutoTimestampModel {
  id!: string;
  userId!: string;
  type!: string;

  static get tableName(): string {
    return 'purchase';
  }

  static get jsonSchema(): JSONSchema {
    return {
      type: 'object',
      required: ['userId', 'type'],
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string' },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'purchase.user_id',
        to: 'user.id',
      },
    },
  };
}

Purchase.knex(knex);

export default Purchase;
