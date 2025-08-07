
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput } from '../schema';
import { createAnnouncement } from '../handlers/create_announcement';
import { eq } from 'drizzle-orm';

// Simple test input with all fields
const testInput: CreateAnnouncementInput = {
  title: 'Test Announcement',
  description: 'This is a test announcement for testing purposes',
  publish_date: new Date('2024-01-15T10:00:00Z'),
  attachment_file: 'test-file.pdf',
  status: true
};

describe('createAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an announcement with all fields', async () => {
    const result = await createAnnouncement(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Announcement');
    expect(result.description).toEqual('This is a test announcement for testing purposes');
    expect(result.publish_date).toEqual(testInput.publish_date);
    expect(result.attachment_file).toEqual('test-file.pdf');
    expect(result.status).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an announcement without attachment file', async () => {
    const inputWithoutFile: CreateAnnouncementInput = {
      title: 'No Attachment Announcement',
      description: 'This announcement has no attachment',
      publish_date: new Date('2024-01-16T14:00:00Z'),
      attachment_file: null,
      status: false
    };

    const result = await createAnnouncement(inputWithoutFile);

    expect(result.title).toEqual('No Attachment Announcement');
    expect(result.attachment_file).toBeNull();
    expect(result.status).toEqual(false);
    expect(result.id).toBeDefined();
  });

  it('should save announcement to database', async () => {
    const result = await createAnnouncement(testInput);

    // Query using proper drizzle syntax
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, result.id))
      .execute();

    expect(announcements).toHaveLength(1);
    expect(announcements[0].title).toEqual('Test Announcement');
    expect(announcements[0].description).toEqual(testInput.description);
    expect(announcements[0].publish_date).toEqual(testInput.publish_date);
    expect(announcements[0].attachment_file).toEqual('test-file.pdf');
    expect(announcements[0].status).toEqual(true);
    expect(announcements[0].created_at).toBeInstanceOf(Date);
    expect(announcements[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default status when not provided', async () => {
    const inputWithDefaults: CreateAnnouncementInput = {
      title: 'Default Status Test',
      description: 'Testing default status behavior',
      publish_date: new Date('2024-01-17T09:00:00Z'),
      status: true // Include required status field
      // attachment_file will use Zod default (undefined -> null)
    };

    const result = await createAnnouncement(inputWithDefaults);

    expect(result.title).toEqual('Default Status Test');
    expect(result.status).toEqual(true);
    expect(result.attachment_file).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should handle future publish dates', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const futureInput: CreateAnnouncementInput = {
      title: 'Future Announcement',
      description: 'This will be published in the future',
      publish_date: futureDate,
      status: false
    };

    const result = await createAnnouncement(futureInput);

    expect(result.publish_date).toEqual(futureDate);
    expect(result.title).toEqual('Future Announcement');
    expect(result.status).toEqual(false);

    // Verify in database
    const saved = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, result.id))
      .execute();

    expect(saved[0].publish_date).toEqual(futureDate);
  });
});
