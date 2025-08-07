
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { deleteUser } from '../handlers/delete_user';
import { eq } from 'drizzle-orm';

describe('deleteUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestUser = async (username: string, role: 'admin' | 'editor' = 'editor', is_active: boolean = true) => {
    const passwordHash = 'hashed_password_123'; // Simple mock hash
    const result = await db.insert(usersTable)
      .values({
        username,
        email: `${username}@example.com`,
        password_hash: passwordHash,
        role,
        is_active
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should delete an existing user', async () => {
    const user = await createTestUser('testuser', 'editor');

    const result = await deleteUser(user.id);

    expect(result).toBe(true);

    // Verify user is deleted from database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    expect(users).toHaveLength(0);
  });

  it('should return false for non-existent user', async () => {
    const result = await deleteUser(999);

    expect(result).toBe(false);
  });

  it('should delete editor user without restrictions', async () => {
    const admin = await createTestUser('admin1', 'admin');
    const editor = await createTestUser('editor1', 'editor');

    const result = await deleteUser(editor.id);

    expect(result).toBe(true);

    // Verify only editor is deleted
    const users = await db.select().from(usersTable).execute();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('admin1');
  });

  it('should prevent deletion of last active admin', async () => {
    const admin = await createTestUser('admin1', 'admin');

    await expect(deleteUser(admin.id)).rejects.toThrow(/cannot delete the last active admin/i);

    // Verify admin still exists
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, admin.id))
      .execute();

    expect(users).toHaveLength(1);
  });

  it('should allow deletion of admin when other active admins exist', async () => {
    const admin1 = await createTestUser('admin1', 'admin');
    const admin2 = await createTestUser('admin2', 'admin');

    const result = await deleteUser(admin1.id);

    expect(result).toBe(true);

    // Verify first admin is deleted, second remains
    const users = await db.select().from(usersTable).execute();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('admin2');
  });

  it('should allow deletion of admin when inactive admin exists', async () => {
    const admin1 = await createTestUser('admin1', 'admin', true);
    const admin2 = await createTestUser('admin2', 'admin', true);
    const inactiveAdmin = await createTestUser('admin3', 'admin', false);

    const result = await deleteUser(admin1.id);

    expect(result).toBe(true);

    // Verify first admin is deleted, others remain
    const users = await db.select().from(usersTable).execute();
    expect(users).toHaveLength(2);
    expect(users.find(u => u.username === 'admin2')).toBeDefined();
    expect(users.find(u => u.username === 'admin3')).toBeDefined();
  });

  it('should prevent deletion when only inactive admins would remain', async () => {
    const admin1 = await createTestUser('admin1', 'admin');
    const inactiveAdmin = await createTestUser('admin2', 'admin', false);

    await expect(deleteUser(admin1.id)).rejects.toThrow(/cannot delete the last active admin/i);

    // Verify both admins still exist
    const users = await db.select().from(usersTable).execute();
    expect(users).toHaveLength(2);
  });
});
