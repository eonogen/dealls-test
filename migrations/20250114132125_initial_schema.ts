import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.bigIncrements('id').primary();
      table.text('email').notNullable().unique();
      table.text('password').notNullable();
      table.text('full_name').nullable();
      table.text('bio').nullable();
      table.boolean('verified').defaultTo(false);
      table.boolean('quota_enabled').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('user_like', (table) => {
      table.bigIncrements('id').primary();
      table
        .bigInteger('user_id')
        .references('id')
        .inTable('user')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .bigInteger('liked_user_id')
        .references('id')
        .inTable('user')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('purchase', (table) => {
      table.bigIncrements('id').primary();
      table
        .bigInteger('user_id')
        .references('id')
        .inTable('user')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.enu('type', ['UNLIMITED_QUOTA', 'VERIFIED_BADGE'], {
        useNative: true,
        enumName: 'purchase_type',
      });
      table.timestamps(true, true);

      table.unique(['user_id', 'liked_user_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('purchase')
    .dropTableIfExists('user')
    .raw('DROP TYPE IF EXISTS purchase_type;');
}
