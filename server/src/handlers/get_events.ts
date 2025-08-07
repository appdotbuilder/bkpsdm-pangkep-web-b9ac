
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type Event } from '../schema';
import { eq, gte, asc } from 'drizzle-orm';

export const getEvents = async (limit?: number, offset?: number): Promise<Event[]> => {
  try {
    // Build the complete query in one go to avoid type issues
    if (limit !== undefined && offset !== undefined) {
      const results = await db.select()
        .from(eventsTable)
        .limit(limit)
        .offset(offset)
        .execute();
      return results;
    } else if (limit !== undefined) {
      const results = await db.select()
        .from(eventsTable)
        .limit(limit)
        .execute();
      return results;
    } else if (offset !== undefined) {
      const results = await db.select()
        .from(eventsTable)
        .offset(offset)
        .execute();
      return results;
    } else {
      const results = await db.select()
        .from(eventsTable)
        .execute();
      return results;
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
};

export const getUpcomingEvents = async (limit: number = 5): Promise<Event[]> => {
  try {
    const today = new Date();
    // Set to start of day for consistent comparison
    today.setHours(0, 0, 0, 0);

    const results = await db.select()
      .from(eventsTable)
      .where(gte(eventsTable.start_date, today))
      .orderBy(asc(eventsTable.start_date))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error);
    throw error;
  }
};

export const getEventById = async (id: number): Promise<Event | null> => {
  try {
    const results = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch event by ID:', error);
    throw error;
  }
};
