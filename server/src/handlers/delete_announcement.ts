
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteAnnouncement = async (id: number): Promise<boolean> => {
  try {
    // Delete the announcement by ID
    const result = await db.delete(announcementsTable)
      .where(eq(announcementsTable.id, id))
      .returning()
      .execute();

    // Return true if a record was deleted, false otherwise
    return result.length > 0;
  } catch (error) {
    console.error('Announcement deletion failed:', error);
    throw error;
  }
};
