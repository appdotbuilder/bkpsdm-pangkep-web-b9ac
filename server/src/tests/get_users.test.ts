
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers, getUserById, getUserByUsername } from '../handlers/get_users';

// Test user data
const testUser1: CreateUserInput = {
  username: 'testuser1',
  email: 'test1@example.com',
  password: 'password123',
  role: 'admin'
};

const testUser2: CreateUserInput = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password456',
  role: 'editor'
};

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();
    expect(result).toEqual([]);
  });

  it('should return all users without password_hash', async () => {
    // Create test users with simple password hashes
    const hashedPassword1 = 'hashed_password_1';
    const hashedPassword2 = 'hashed_password_2';

    await db.insert(usersTable).values([
      {
        username: testUser1.username,
        email: testUser1.email,
        password_hash: hashedPassword1,
        role: testUser1.role
      },
      {
        username: testUser2.username,
        email: testUser2.email,
        password_hash: hashedPassword2,
        role: testUser2.role
      }
    ]).execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].username).toEqual('testuser1');
    expect(result[0].email).toEqual('test1@example.com');
    expect(result[0].role).toEqual('admin');
    expect(result[0].password_hash).toEqual(''); // Should be excluded
    expect(result[0].is_active).toBe(true);
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].username).toEqual('testuser2');
    expect(result[1].email).toEqual('test2@example.com');
    expect(result[1].role).toEqual('editor');
    expect(result[1].password_hash).toEqual(''); // Should be excluded
  });

  it('should apply pagination correctly', async () => {
    // Create multiple test users
    const hashedPassword = 'hashed_password';

    await db.insert(usersTable).values([
      { username: 'user1', email: 'user1@example.com', password_hash: hashedPassword, role: 'admin' },
      { username: 'user2', email: 'user2@example.com', password_hash: hashedPassword, role: 'editor' },
      { username: 'user3', email: 'user3@example.com', password_hash: hashedPassword, role: 'admin' }
    ]).execute();

    // Test limit
    const limitedResult = await getUsers(2);
    expect(limitedResult).toHaveLength(2);

    // Test offset
    const offsetResult = await getUsers(2, 1);
    expect(offsetResult).toHaveLength(2);
    expect(offsetResult[0].username).not.toEqual(limitedResult[0].username);

    // Test limit with offset
    const paginatedResult = await getUsers(1, 2);
    expect(paginatedResult).toHaveLength(1);
    expect(paginatedResult[0].username).toEqual('user3');
  });
});

describe('getUserById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when user does not exist', async () => {
    const result = await getUserById(999);
    expect(result).toBeNull();
  });

  it('should return user by ID without password_hash', async () => {
    // Create test user
    const hashedPassword = 'hashed_password_test';

    const insertResult = await db.insert(usersTable).values({
      username: testUser1.username,
      email: testUser1.email,
      password_hash: hashedPassword,
      role: testUser1.role
    }).returning().execute();

    const userId = insertResult[0].id;
    const result = await getUserById(userId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(userId);
    expect(result!.username).toEqual('testuser1');
    expect(result!.email).toEqual('test1@example.com');
    expect(result!.role).toEqual('admin');
    expect(result!.password_hash).toEqual(''); // Should be excluded
    expect(result!.is_active).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
  });
});

describe('getUserByUsername', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when user does not exist', async () => {
    const result = await getUserByUsername('nonexistent');
    expect(result).toBeNull();
  });

  it('should return user by username with password_hash for authentication', async () => {
    // Create test user
    const hashedPassword = 'hashed_password_auth';

    await db.insert(usersTable).values({
      username: testUser1.username,
      email: testUser1.email,
      password_hash: hashedPassword,
      role: testUser1.role
    }).execute();

    const result = await getUserByUsername('testuser1');

    expect(result).not.toBeNull();
    expect(result!.username).toEqual('testuser1');
    expect(result!.email).toEqual('test1@example.com');
    expect(result!.role).toEqual('admin');
    expect(result!.password_hash).toEqual(hashedPassword); // Should include for authentication
    expect(result!.is_active).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should be case sensitive for username', async () => {
    // Create test user
    const hashedPassword = 'hashed_password_case';

    await db.insert(usersTable).values({
      username: testUser1.username,
      email: testUser1.email,
      password_hash: hashedPassword,
      role: testUser1.role
    }).execute();

    const result = await getUserByUsername('TESTUSER1');
    expect(result).toBeNull();
  });
});
