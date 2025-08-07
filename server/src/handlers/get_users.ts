
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type User } from '../schema';

export const getUsers = async (limit?: number, offset?: number): Promise<User[]> => {
  try {
    // Build query without type reassignment
    const baseQuery = db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      password_hash: usersTable.password_hash,
      role: usersTable.role,
      is_active: usersTable.is_active,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at
    }).from(usersTable);

    // Apply pagination in a single chain
    const results = await (async () => {
      if (limit !== undefined && offset !== undefined) {
        return baseQuery.limit(limit).offset(offset).execute();
      } else if (limit !== undefined) {
        return baseQuery.limit(limit).execute();
      } else if (offset !== undefined) {
        return baseQuery.offset(offset).execute();
      } else {
        return baseQuery.execute();
      }
    })();

    // Exclude password_hash from returned data
    return results.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: '', // Exclude sensitive data
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  } catch (error) {
    console.error('Failed to get users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const results = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      password_hash: usersTable.password_hash,
      role: usersTable.role,
      is_active: usersTable.is_active,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at
    })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    // Exclude password_hash from returned data
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: '', // Exclude sensitive data
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const results = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Include password_hash for authentication purposes
    return results[0];
  } catch (error) {
    console.error('Failed to get user by username:', error);
    throw error;
  }
};
