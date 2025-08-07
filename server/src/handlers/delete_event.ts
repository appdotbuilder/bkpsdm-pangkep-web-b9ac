
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteEvent = async (id: number): Promise<boolean> => {
  try {
    // Delete event by ID
    const result = await db.delete(eventsTable)
      .where(eq(eventsTable.id, id))
      .execute();

    // Return true if a row was deleted, false if no row was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Event deletion failed:', error);
    throw error;
  }
};
