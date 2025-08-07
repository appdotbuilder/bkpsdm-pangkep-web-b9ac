
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

const testCreateInput: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'editor'
};

const testUpdateInput: UpdateUserInput = {
  id: 1,
  username: 'updateduser',
  email: 'updated@example.com',
  role: 'admin',
  is_active: false
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a user', async () => {
    // Create initial user
    const hashedPassword = await Bun.password.hash(testCreateInput.password);
    await db.insert(usersTable)
      .values({
        username: testCreateInput.username,
        email: testCreateInput.email,
        password_hash: hashedPassword,
        role: testCreateInput.role
      })
      .execute();

    const result = await updateUser(testUpdateInput);

    // Basic field validation
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(1);
    expect(result!.username).toEqual('updateduser');
    expect(result!.email).toEqual('updated@example.com');
    expect(result!.role).toEqual('admin');
    expect(result!.is_active).toEqual(false);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated user to database', async () => {
    // Create initial user
    const hashedPassword = await Bun.password.hash(testCreateInput.password);
    await db.insert(usersTable)
      .values({
        username: testCreateInput.username,
        email: testCreateInput.email,
        password_hash: hashedPassword,
        role: testCreateInput.role
      })
      .execute();

    await updateUser(testUpdateInput);

    // Query updated user from database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, 1))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('updateduser');
    expect(users[0].email).toEqual('updated@example.com');
    expect(users[0].role).toEqual('admin');
    expect(users[0].is_active).toEqual(false);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update password and hash it', async () => {
    // Create initial user
    const hashedPassword = await Bun.password.hash(testCreateInput.password);
    await db.insert(usersTable)
      .values({
        username: testCreateInput.username,
        email: testCreateInput.email,
        password_hash: hashedPassword,
        role: testCreateInput.role
      })
      .execute();

    const updateWithPassword: UpdateUserInput = {
      id: 1,
      password: 'newpassword123'
    };

    const result = await updateUser(updateWithPassword);

    expect(result).not.toBeNull();
    expect(result!.password_hash).not.toEqual(hashedPassword);
    expect(result!.password_hash).not.toEqual('newpassword123');
    
    // Verify password is properly hashed
    const isValidPassword = await Bun.password.verify('newpassword123', result!.password_hash);
    expect(isValidPassword).toBe(true);
  });

  it('should handle partial updates', async () => {
    // Create initial user
    const hashedPassword = await Bun.password.hash(testCreateInput.password);
    await db.insert(usersTable)
      .values({
        username: testCreateInput.username,
        email: testCreateInput.email,
        password_hash: hashedPassword,
        role: testCreateInput.role
      })
      .execute();

    const partialUpdate: UpdateUserInput = {
      id: 1,
      username: 'partialupdate'
    };

    const result = await updateUser(partialUpdate);

    expect(result).not.toBeNull();
    expect(result!.username).toEqual('partialupdate');
    expect(result!.email).toEqual(testCreateInput.email); // Unchanged
    expect(result!.role).toEqual(testCreateInput.role); // Unchanged
    expect(result!.is_active).toEqual(true); // Default value unchanged
  });

  it('should return null for non-existent user', async () => {
    const nonExistentUpdate: UpdateUserInput = {
      id: 999,
      username: 'nonexistent'
    };

    const result = await updateUser(nonExistentUpdate);

    expect(result).toBeNull();
  });

  it('should update timestamp correctly', async () => {
    // Create initial user
    const hashedPassword = await Bun.password.hash(testCreateInput.password);
    const initialUser = await db.insert(usersTable)
      .values({
        username: testCreateInput.username,
        email: testCreateInput.email,
        password_hash: hashedPassword,
        role: testCreateInput.role
      })
      .returning()
      .execute();

    const originalUpdatedAt = initialUser[0].updated_at;

    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await updateUser({
      id: 1,
      username: 'timestamptest'
    });

    expect(result).not.toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
