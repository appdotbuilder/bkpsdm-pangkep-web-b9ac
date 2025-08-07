
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { deleteAnnouncement } from '../handlers/delete_announcement';
import { eq } from 'drizzle-orm';

describe('deleteAnnouncement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing announcement', async () => {
    // Create test announcement
    const testAnnouncement = await db.insert(announcementsTable)
      .values({
        title: 'Test Announcement',
        description: 'A test announcement',
        publish_date: new Date(),
        attachment_file: null,
        status: true
      })
      .returning()
      .execute();

    const announcementId = testAnnouncement[0].id;

    // Delete the announcement
    const result = await deleteAnnouncement(announcementId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify the announcement is deleted from database
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, announcementId))
      .execute();

    expect(announcements).toHaveLength(0);
  });

  it('should return false when announcement does not exist', async () => {
    const nonExistentId = 999;

    const result = await deleteAnnouncement(nonExistentId);

    expect(result).toBe(false);
  });

  it('should delete announcement with attachment file', async () => {
    // Create test announcement with attachment
    const testAnnouncement = await db.insert(announcementsTable)
      .values({
        title: 'Test Announcement with File',
        description: 'A test announcement with attachment',
        publish_date: new Date(),
        attachment_file: '/uploads/test-file.pdf',
        status: true
      })
      .returning()
      .execute();

    const announcementId = testAnnouncement[0].id;

    // Delete the announcement
    const result = await deleteAnnouncement(announcementId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify the announcement is deleted from database
    const announcements = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, announcementId))
      .execute();

    expect(announcements).toHaveLength(0);
  });
});
