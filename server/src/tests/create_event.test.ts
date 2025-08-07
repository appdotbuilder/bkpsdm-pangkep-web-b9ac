
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput } from '../schema';
import { createEvent } from '../handlers/create_event';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateEventInput = {
  event_name: 'Annual Conference',
  start_date: new Date('2024-12-15T09:00:00Z'),
  end_date: new Date('2024-12-15T17:00:00Z'),
  time: '09:00 - 17:00',
  location: 'Conference Hall A',
  description: 'Annual company conference with keynote speakers',
  organizer: 'Event Management Team'
};

describe('createEvent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an event', async () => {
    const result = await createEvent(testInput);

    // Basic field validation
    expect(result.event_name).toEqual('Annual Conference');
    expect(result.start_date).toEqual(testInput.start_date);
    expect(result.end_date).toEqual(testInput.end_date);
    expect(result.time).toEqual('09:00 - 17:00');
    expect(result.location).toEqual('Conference Hall A');
    expect(result.description).toEqual(testInput.description);
    expect(result.organizer).toEqual('Event Management Team');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save event to database', async () => {
    const result = await createEvent(testInput);

    // Query using proper drizzle syntax
    const events = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, result.id))
      .execute();

    expect(events).toHaveLength(1);
    expect(events[0].event_name).toEqual('Annual Conference');
    expect(events[0].start_date).toEqual(testInput.start_date);
    expect(events[0].end_date).toEqual(testInput.end_date);
    expect(events[0].time).toEqual('09:00 - 17:00');
    expect(events[0].location).toEqual('Conference Hall A');
    expect(events[0].description).toEqual(testInput.description);
    expect(events[0].organizer).toEqual('Event Management Team');
    expect(events[0].created_at).toBeInstanceOf(Date);
    expect(events[0].updated_at).toBeInstanceOf(Date);
  });

  it('should reject when end_date is before start_date', async () => {
    const invalidInput: CreateEventInput = {
      ...testInput,
      start_date: new Date('2024-12-15T17:00:00Z'),
      end_date: new Date('2024-12-15T09:00:00Z') // Earlier than start_date
    };

    await expect(createEvent(invalidInput))
      .rejects.toThrow(/End date must be after start date/i);
  });

  it('should allow same start and end date', async () => {
    const sameDate = new Date('2024-12-15T10:00:00Z');
    const sameDateInput: CreateEventInput = {
      ...testInput,
      start_date: sameDate,
      end_date: sameDate
    };

    const result = await createEvent(sameDateInput);

    expect(result.start_date).toEqual(sameDate);
    expect(result.end_date).toEqual(sameDate);
    expect(result.id).toBeDefined();
  });

  it('should handle multi-day events', async () => {
    const multiDayInput: CreateEventInput = {
      ...testInput,
      event_name: 'Multi-day Workshop',
      start_date: new Date('2024-12-15T09:00:00Z'),
      end_date: new Date('2024-12-17T17:00:00Z'),
      time: 'All day',
      description: 'Three-day intensive workshop'
    };

    const result = await createEvent(multiDayInput);

    expect(result.event_name).toEqual('Multi-day Workshop');
    expect(result.start_date).toEqual(multiDayInput.start_date);
    expect(result.end_date).toEqual(multiDayInput.end_date);
    expect(result.time).toEqual('All day');
    expect(result.description).toEqual('Three-day intensive workshop');
  });
});
