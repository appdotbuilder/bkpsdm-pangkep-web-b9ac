
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type UpdateEventInput, type Event } from '../schema';
import { eq } from 'drizzle-orm';

export const updateEvent = async (input: UpdateEventInput): Promise<Event | null> => {
  try {
    // Extract id from input and prepare update data
    const { id, ...updateData } = input;

    // Check if event exists first
    const existingEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .execute();

    if (existingEvent.length === 0) {
      return null;
    }

    // Perform update with only provided fields
    const result = await db.update(eventsTable)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(eventsTable.id, id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Event update failed:', error);
    throw error;
  }
};
