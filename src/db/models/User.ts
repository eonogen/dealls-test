import { JSONSchema, Model } from 'objection';
import AutoTimestampModel from './base/AutoTimestampModel.js';
import knex from '@/db/knex.js';
import Purchase from './Purchase.js';

class User extends AutoTimestampModel {
  id!: string;
  email!: string;
  password!: string;
  fullName?: string;
  bio?: string;
  verified?: boolean;
  quotaEnabled?: boolean;

  static get tableName(): string {
    return 'user';
  }

  static get jsonSchema(): JSONSchema {
    return {
      type: 'object',
      required: ['email'],
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        fullName: { type: 'string' },
        bio: { type: 'string' },
        verified: { type: 'boolean' },
        quotaEnabled: { type: 'boolean' },
      },
    };
  }
  static relationMappings = {
    purchase: {
      relation: Model.HasManyRelation,
      modelClass: Purchase,
      join: {
        from: 'user_like.user_id',
        to: 'user.id',
      },
    },
    likedUsers: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'user.id',
        through: {
          from: 'user_like.user_id',
          to: 'user_like.liked_user_id',
        },
        to: 'user.id',
      },
    },
  };

  static async userExists(email: string) {
    const user = await User.query().select('email').findOne({ email });
    return !!user;
  }
}

User.knex(knex);

export default User;
