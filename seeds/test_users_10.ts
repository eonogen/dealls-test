import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user').del();

  const defaultHash = bcrypt.hashSync('testpassw0rd', 8);
  // Inserts seed entries
  await knex('user').insert(
    Array.from({ length: 10 }, (_, index) => ({
      email: `testuser${String(index).padStart(2, '0')}@example.com`,
      password: defaultHash,
      full_name: `Test User ${String(index).padStart(2, '0')}`,
    })),
  );
}
