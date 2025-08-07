
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput, type UpdateEventInput } from '../schema';
import { updateEvent } from '../handlers/update_event';
import { eq } from 'drizzle-orm';

// Helper to create a test event
const createTestEvent = async (): Promise<number> => {
  const eventData: CreateEventInput = {
    event_name: 'Test Event',
    start_date: new Date('2024-06-01'),
    end_date: new Date('2024-06-02'),
    time: '09:00-17:00',
    location: 'Test Location',
    description: 'Test event description',
    organizer: 'Test Organizer'
  };

  const result = await db.insert(eventsTable)
    .values({
      ...eventData,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateEvent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update event fields', async () => {
    const eventId = await createTestEvent();

    const updateInput: UpdateEventInput = {
      id: eventId,
      event_name: 'Updated Event Name',
      location: 'Updated Location',
      description: 'Updated description'
    };

    const result = await updateEvent(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(eventId);
    expect(result!.event_name).toBe('Updated Event Name');
    expect(result!.location).toBe('Updated Location');
    expect(result!.description).toBe('Updated description');
    expect(result!.time).toBe('09:00-17:00'); // Unchanged field
    expect(result!.organizer).toBe('Test Organizer'); // Unchanged field
  });

  it('should update dates correctly', async () => {
    const eventId = await createTestEvent();

    const newStartDate = new Date('2024-07-01');
    const newEndDate = new Date('2024-07-03');

    const updateInput: UpdateEventInput = {
      id: eventId,
      start_date: newStartDate,
      end_date: newEndDate
    };

    const result = await updateEvent(updateInput);

    expect(result).not.toBeNull();
    expect(result!.start_date).toEqual(newStartDate);
    expect(result!.end_date).toEqual(newEndDate);
  });

  it('should update single field only', async () => {
    const eventId = await createTestEvent();

    const updateInput: UpdateEventInput = {
      id: eventId,
      time: '10:00-18:00'
    };

    const result = await updateEvent(updateInput);

    expect(result).not.toBeNull();
    expect(result!.time).toBe('10:00-18:00');
    expect(result!.event_name).toBe('Test Event'); // Unchanged
    expect(result!.location).toBe('Test Location'); // Unchanged
  });

  it('should update updated_at timestamp', async () => {
    const eventId = await createTestEvent();

    // Get original event
    const originalEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .execute();

    const originalUpdatedAt = originalEvent[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateEventInput = {
      id: eventId,
      event_name: 'Updated Name'
    };

    const result = await updateEvent(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save changes to database', async () => {
    const eventId = await createTestEvent();

    const updateInput: UpdateEventInput = {
      id: eventId,
      event_name: 'Database Updated Event',
      organizer: 'Updated Organizer'
    };

    await updateEvent(updateInput);

    // Verify changes were saved to database
    const savedEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .execute();

    expect(savedEvent).toHaveLength(1);
    expect(savedEvent[0].event_name).toBe('Database Updated Event');
    expect(savedEvent[0].organizer).toBe('Updated Organizer');
    expect(savedEvent[0].location).toBe('Test Location'); // Unchanged field
  });

  it('should return null for non-existent event', async () => {
    const updateInput: UpdateEventInput = {
      id: 99999, // Non-existent ID
      event_name: 'Should Not Update'
    };

    const result = await updateEvent(updateInput);

    expect(result).toBeNull();
  });

  it('should handle all fields update', async () => {
    const eventId = await createTestEvent();

    const updateInput: UpdateEventInput = {
      id: eventId,
      event_name: 'Completely Updated Event',
      start_date: new Date('2024-08-01'),
      end_date: new Date('2024-08-02'),
      time: '08:00-16:00',
      location: 'New Location',
      description: 'New description',
      organizer: 'New Organizer'
    };

    const result = await updateEvent(updateInput);

    expect(result).not.toBeNull();
    expect(result!.event_name).toBe('Completely Updated Event');
    expect(result!.start_date).toEqual(new Date('2024-08-01'));
    expect(result!.end_date).toEqual(new Date('2024-08-02'));
    expect(result!.time).toBe('08:00-16:00');
    expect(result!.location).toBe('New Location');
    expect(result!.description).toBe('New description');
    expect(result!.organizer).toBe('New Organizer');
  });
});
