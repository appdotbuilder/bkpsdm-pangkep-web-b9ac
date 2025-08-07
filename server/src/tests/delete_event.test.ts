
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deleteEvent } from '../handlers/delete_event';

// Test event data
const testEventData = {
  event_name: 'Test Event',
  start_date: new Date('2024-01-15'),
  end_date: new Date('2024-01-16'),
  time: '10:00 AM',
  location: 'Conference Room A',
  description: 'A test event for deletion testing',
  organizer: 'Test Organizer'
};

describe('deleteEvent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing event', async () => {
    // Create event first
    const createdEvents = await db.insert(eventsTable)
      .values(testEventData)
      .returning()
      .execute();

    const eventId = createdEvents[0].id;

    // Delete the event
    const result = await deleteEvent(eventId);

    expect(result).toBe(true);

    // Verify event is deleted from database
    const events = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .execute();

    expect(events).toHaveLength(0);
  });

  it('should return false when event does not exist', async () => {
    const nonExistentId = 999;

    const result = await deleteEvent(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other events when deleting one', async () => {
    // Create two events
    const event1Data = {
      ...testEventData,
      event_name: 'Event 1'
    };
    
    const event2Data = {
      ...testEventData,
      event_name: 'Event 2',
      start_date: new Date('2024-02-15'),
      end_date: new Date('2024-02-16')
    };

    const createdEvents = await db.insert(eventsTable)
      .values([event1Data, event2Data])
      .returning()
      .execute();

    const event1Id = createdEvents[0].id;
    const event2Id = createdEvents[1].id;

    // Delete first event
    const result = await deleteEvent(event1Id);

    expect(result).toBe(true);

    // Verify first event is deleted
    const deletedEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, event1Id))
      .execute();

    expect(deletedEvent).toHaveLength(0);

    // Verify second event still exists
    const remainingEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, event2Id))
      .execute();

    expect(remainingEvent).toHaveLength(1);
    expect(remainingEvent[0].event_name).toBe('Event 2');
  });
});
