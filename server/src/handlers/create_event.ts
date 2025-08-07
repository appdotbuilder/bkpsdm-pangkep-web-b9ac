
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput, type Event } from '../schema';

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  try {
    // Validate that end_date is after start_date
    if (input.end_date < input.start_date) {
      throw new Error('End date must be after start date');
    }

    // Insert event record
    const result = await db.insert(eventsTable)
      .values({
        event_name: input.event_name,
        start_date: input.start_date,
        end_date: input.end_date,
        time: input.time,
        location: input.location,
        description: input.description,
        organizer: input.organizer
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Event creation failed:', error);
    throw error;
  }
};
