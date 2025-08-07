
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput } from '../schema';
import { getEvents, getUpcomingEvents, getEventById } from '../handlers/get_events';

// Create future dates that will definitely be upcoming
const futureDate1 = new Date();
futureDate1.setFullYear(futureDate1.getFullYear() + 1); // Next year
futureDate1.setMonth(0, 15); // January 15th

const futureDate2 = new Date();
futureDate2.setFullYear(futureDate2.getFullYear() + 1); // Next year  
futureDate2.setMonth(1, 20); // February 20th

const futureDate1End = new Date(futureDate1);
futureDate1End.setDate(futureDate1End.getDate() + 1); // Next day

const futureDate2End = new Date(futureDate2);
futureDate2End.setDate(futureDate2End.getDate() + 1); // Next day

// Test event data
const testEvent1: CreateEventInput = {
  event_name: 'Test Event 1',
  start_date: futureDate1,
  end_date: futureDate1End,
  time: '09:00-17:00',
  location: 'Conference Hall A',
  description: 'First test event',
  organizer: 'Test Organizer 1'
};

const testEvent2: CreateEventInput = {
  event_name: 'Test Event 2', 
  start_date: futureDate2,
  end_date: futureDate2End,
  time: '10:00-16:00',
  location: 'Meeting Room B',
  description: 'Second test event',
  organizer: 'Test Organizer 2'
};

const pastEvent: CreateEventInput = {
  event_name: 'Past Event',
  start_date: new Date('2020-01-01'),
  end_date: new Date('2020-01-02'),
  time: '08:00-18:00',
  location: 'Old Venue',
  description: 'Event from the past',
  organizer: 'Past Organizer'
};

describe('getEvents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all events when no pagination provided', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getEvents();

    expect(result).toHaveLength(3);
    expect(result[0].event_name).toEqual('Test Event 1');
    expect(result[1].event_name).toEqual('Test Event 2');
    expect(result[2].event_name).toEqual('Past Event');
  });

  it('should apply limit when provided', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getEvents(2);

    expect(result).toHaveLength(2);
  });

  it('should apply offset when provided', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getEvents(undefined, 1);

    expect(result).toHaveLength(2);
    // Should skip first event
    expect(result[0].event_name).toEqual('Test Event 2');
    expect(result[1].event_name).toEqual('Past Event');
  });

  it('should apply both limit and offset', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getEvents(1, 1);

    expect(result).toHaveLength(1);
    expect(result[0].event_name).toEqual('Test Event 2');
  });

  it('should return empty array when no events exist', async () => {
    const result = await getEvents();

    expect(result).toHaveLength(0);
  });
});

describe('getUpcomingEvents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only upcoming events ordered by start date', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getUpcomingEvents();

    expect(result).toHaveLength(2);
    // Should be ordered by start_date ASC
    expect(result[0].event_name).toEqual('Test Event 1');
    expect(result[0].start_date).toEqual(futureDate1);
    expect(result[1].event_name).toEqual('Test Event 2');
    expect(result[1].start_date).toEqual(futureDate2);
  });

  it('should respect limit parameter', async () => {
    // Insert test events
    await db.insert(eventsTable).values([testEvent1, testEvent2, pastEvent]).execute();

    const result = await getUpcomingEvents(1);

    expect(result).toHaveLength(1);
    expect(result[0].event_name).toEqual('Test Event 1');
  });

  it('should use default limit of 5', async () => {
    // Create 6 future events
    const baseFutureDate = new Date();
    baseFutureDate.setFullYear(baseFutureDate.getFullYear() + 2); // 2 years from now
    
    const futureEvents = Array.from({ length: 6 }, (_, i) => {
      const startDate = new Date(baseFutureDate);
      startDate.setDate(startDate.getDate() + i); // Consecutive days
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      return {
        event_name: `Future Event ${i + 1}`,
        start_date: startDate,
        end_date: endDate,
        time: '09:00-17:00',
        location: 'Test Location',
        description: `Future event ${i + 1}`,
        organizer: 'Test Organizer'
      };
    });

    await db.insert(eventsTable).values(futureEvents).execute();

    const result = await getUpcomingEvents();

    expect(result).toHaveLength(5); // Default limit
  });

  it('should return empty array when no upcoming events exist', async () => {
    // Insert only past events
    await db.insert(eventsTable).values([pastEvent]).execute();

    const result = await getUpcomingEvents();

    expect(result).toHaveLength(0);
  });

  it('should include events starting today', async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon today

    const todayEvent: CreateEventInput = {
      event_name: 'Today Event',
      start_date: today,
      end_date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '12:00-18:00',
      location: 'Current Venue',
      description: 'Event starting today',
      organizer: 'Today Organizer'
    };

    await db.insert(eventsTable).values([todayEvent, pastEvent]).execute();

    const result = await getUpcomingEvents();

    expect(result).toHaveLength(1);
    expect(result[0].event_name).toEqual('Today Event');
  });
});

describe('getEventById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return event when ID exists', async () => {
    // Insert test event
    const insertResult = await db.insert(eventsTable).values([testEvent1]).returning().execute();
    const eventId = insertResult[0].id;

    const result = await getEventById(eventId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(eventId);
    expect(result!.event_name).toEqual('Test Event 1');
    expect(result!.start_date).toEqual(futureDate1);
    expect(result!.end_date).toEqual(futureDate1End);
    expect(result!.time).toEqual('09:00-17:00');
    expect(result!.location).toEqual('Conference Hall A');
    expect(result!.description).toEqual('First test event');
    expect(result!.organizer).toEqual('Test Organizer 1');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when ID does not exist', async () => {
    const result = await getEventById(999);

    expect(result).toBeNull();
  });

  it('should return correct event when multiple events exist', async () => {
    // Insert multiple test events
    const insertResult = await db.insert(eventsTable).values([testEvent1, testEvent2]).returning().execute();
    const secondEventId = insertResult[1].id;

    const result = await getEventById(secondEventId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(secondEventId);
    expect(result!.event_name).toEqual('Test Event 2');
    expect(result!.location).toEqual('Meeting Room B');
  });
});
