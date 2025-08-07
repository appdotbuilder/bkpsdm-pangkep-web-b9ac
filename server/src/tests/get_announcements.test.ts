
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput } from '../schema';
import { getAnnouncements, getAnnouncementById, getAllAnnouncements } from '../handlers/get_announcements';

// Test announcement data
const testAnnouncement1: CreateAnnouncementInput = {
  title: 'Active Announcement 1',
  description: 'This is an active announcement',
  publish_date: new Date('2024-01-15'),
  attachment_file: null,
  status: true
};

const testAnnouncement2: CreateAnnouncementInput = {
  title: 'Inactive Announcement',
  description: 'This is an inactive announcement',
  publish_date: new Date('2024-01-10'),
  attachment_file: 'document.pdf',
  status: false
};

const testAnnouncement3: CreateAnnouncementInput = {
  title: 'Active Announcement 2',
  description: 'Another active announcement',
  publish_date: new Date('2024-01-20'),
  attachment_file: null,
  status: true
};

describe('getAnnouncements', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch only active announcements', async () => {
    // Create test data
    await db.insert(announcementsTable).values([
      testAnnouncement1,
      testAnnouncement2, // inactive
      testAnnouncement3
    ]).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(2);
    result.forEach(announcement => {
      expect(announcement.status).toBe(true);
    });
  });

  it('should order announcements by publish_date descending', async () => {
    // Create test data with different publish dates
    await db.insert(announcementsTable).values([
      testAnnouncement1, // 2024-01-15
      testAnnouncement3  // 2024-01-20
    ]).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(2);
    expect(result[0].publish_date >= result[1].publish_date).toBe(true);
    expect(result[0].title).toEqual('Active Announcement 2'); // Latest first
  });

  it('should support pagination', async () => {
    // Create multiple announcements
    await db.insert(announcementsTable).values([
      testAnnouncement1,
      testAnnouncement3,
      {
        ...testAnnouncement1,
        title: 'Active Announcement 3',
        publish_date: new Date('2024-01-25')
      }
    ]).execute();

    // Test limit
    const firstPage = await getAnnouncements(2, 0);
    expect(firstPage).toHaveLength(2);

    // Test offset
    const secondPage = await getAnnouncements(2, 2);
    expect(secondPage).toHaveLength(1);
  });

  it('should use default pagination values', async () => {
    // Create test data
    await db.insert(announcementsTable).values([testAnnouncement1]).execute();

    const result = await getAnnouncements();

    expect(result).toHaveLength(1);
  });
});

describe('getAnnouncementById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch announcement by ID', async () => {
    // Create test data
    const created = await db.insert(announcementsTable)
      .values(testAnnouncement1)
      .returning()
      .execute();

    const result = await getAnnouncementById(created[0].id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(created[0].id);
    expect(result!.title).toEqual('Active Announcement 1');
    expect(result!.description).toEqual(testAnnouncement1.description);
  });

  it('should return null for non-existent ID', async () => {
    const result = await getAnnouncementById(999);

    expect(result).toBeNull();
  });

  it('should fetch both active and inactive announcements', async () => {
    // Create inactive announcement
    const created = await db.insert(announcementsTable)
      .values(testAnnouncement2)
      .returning()
      .execute();

    const result = await getAnnouncementById(created[0].id);

    expect(result).toBeDefined();
    expect(result!.status).toBe(false);
    expect(result!.title).toEqual('Inactive Announcement');
  });
});

describe('getAllAnnouncements', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch all announcements including inactive ones', async () => {
    // Create test data
    await db.insert(announcementsTable).values([
      testAnnouncement1, // active
      testAnnouncement2, // inactive
      testAnnouncement3  // active
    ]).execute();

    const result = await getAllAnnouncements();

    expect(result).toHaveLength(3);
    
    const activeCount = result.filter(a => a.status === true).length;
    const inactiveCount = result.filter(a => a.status === false).length;
    
    expect(activeCount).toBe(2);
    expect(inactiveCount).toBe(1);
  });

  it('should order announcements by created_at descending', async () => {
    // Create test data (they will have different created_at timestamps)
    await db.insert(announcementsTable).values([testAnnouncement1]).execute();
    
    // Small delay to ensure different created_at
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(announcementsTable).values([testAnnouncement2]).execute();

    const result = await getAllAnnouncements();

    expect(result).toHaveLength(2);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should support pagination', async () => {
    // Create multiple announcements
    await db.insert(announcementsTable).values([
      testAnnouncement1,
      testAnnouncement2,
      testAnnouncement3
    ]).execute();

    // Test limit
    const firstPage = await getAllAnnouncements(2, 0);
    expect(firstPage).toHaveLength(2);

    // Test offset
    const secondPage = await getAllAnnouncements(2, 2);
    expect(secondPage).toHaveLength(1);
  });

  it('should use default pagination values', async () => {
    // Create test data
    await db.insert(announcementsTable).values([testAnnouncement1]).execute();

    const result = await getAllAnnouncements();

    expect(result).toHaveLength(1);
  });
});
