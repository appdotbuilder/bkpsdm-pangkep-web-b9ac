
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    // First, check if the user exists
    const userToDelete = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    if (userToDelete.length === 0) {
      return false; // User not found
    }

    const user = userToDelete[0];

    // If the user is an admin, check if they are the last admin
    if (user.role === 'admin') {
      // Count active admins excluding the one being deleted
      const otherActiveAdmins = await db.select()
        .from(usersTable)
        .where(and(
          eq(usersTable.role, 'admin'),
          eq(usersTable.is_active, true),
          ne(usersTable.id, id) // Exclude the user being deleted
        ))
        .execute();

      // Prevent deletion if no other active admins exist
      if (otherActiveAdmins.length === 0) {
        throw new Error('Cannot delete the last active admin user');
      }
    }

    // Delete the user
    const result = await db.delete(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('User deletion failed:', error);
    throw error;
  }
};
