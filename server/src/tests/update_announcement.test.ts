
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput, type UpdateAnnouncementInput } from '../schema';
import { updateAnnouncement } from '../handlers/update_announcement';
import { eq } from 'drizzle-orm';

// Test data
const testAnnouncementInput: CreateAnnouncementInput = {
  title: 'Test Announcement',
  description: 'A test announcement description',
  publish_date: new Date('2024-01-15'),
  attachment_file: null,
  status: true
};

const createTestAnnouncement = async () => {
  const result = await db.insert(announcementsTable)
    .values(testAnnouncementInput)
    .returning()
    .execute();
  return result[0];
};

describe('updateAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update announcement fields', async () => {
    const announcement = await createTestAnnouncement();
    
    const updateInput: UpdateAnnouncementInput = {
      id: announcement.id,
      title: 'Updated Announcement',
      description: 'Updated description',
      status: false
    };

    const result = await updateAnnouncement(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(announcement.id);
    expect(result!.title).toEqual('Updated Announcement');
    expect(result!.description).toEqual('Updated description');
    expect(result!.status).toEqual(false);
    expect(result!.publish_date).toEqual(announcement.publish_date);
    expect(result!.attachment_file).toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > announcement.updated_at).toBe(true);
  });

  it('should update only provided fields', async () => {
    const announcement = await createTestAnnouncement();
    
    const updateInput: UpdateAnnouncementInput = {
      id: announcement.id,
      title: 'Partially Updated Title'
    };

    const result = await updateAnnouncement(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partially Updated Title');
    expect(result!.description).toEqual(announcement.description);
    expect(result!.publish_date).toEqual(announcement.publish_date);
    expect(result!.status).toEqual(announcement.status);
    expect(result!.attachment_file).toEqual(announcement.attachment_file);
  });

  it('should save updated announcement to database', async () => {
    const announcement = await createTestAnnouncement();
    
    const updateInput: UpdateAnnouncementInput = {
      id: announcement.id,
      title: 'Database Updated Title',
      attachment_file: '/path/to/file.pdf'
    };

    await updateAnnouncement(updateInput);

    const savedAnnouncement = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, announcement.id))
      .execute();

    expect(savedAnnouncement).toHaveLength(1);
    expect(savedAnnouncement[0].title).toEqual('Database Updated Title');
    expect(savedAnnouncement[0].attachment_file).toEqual('/path/to/file.pdf');
    expect(savedAnnouncement[0].updated_at).toBeInstanceOf(Date);
    expect(savedAnnouncement[0].updated_at > announcement.updated_at).toBe(true);
  });

  it('should return null for non-existent announcement', async () => {
    const updateInput: UpdateAnnouncementInput = {
      id: 999999,
      title: 'Non-existent Announcement'
    };

    const result = await updateAnnouncement(updateInput);

    expect(result).toBeNull();
  });

  it('should handle date updates correctly', async () => {
    const announcement = await createTestAnnouncement();
    const newDate = new Date('2024-02-20');
    
    const updateInput: UpdateAnnouncementInput = {
      id: announcement.id,
      publish_date: newDate
    };

    const result = await updateAnnouncement(updateInput);

    expect(result).not.toBeNull();
    expect(result!.publish_date).toEqual(newDate);
  });

  it('should handle null attachment_file update', async () => {
    const announcement = await createTestAnnouncement();
    
    // First set an attachment
    await updateAnnouncement({
      id: announcement.id,
      attachment_file: '/some/file.pdf'
    });

    // Then set it to null
    const result = await updateAnnouncement({
      id: announcement.id,
      attachment_file: null
    });

    expect(result).not.toBeNull();
    expect(result!.attachment_file).toBeNull();
  });
});
