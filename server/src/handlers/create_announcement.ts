
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type CreateAnnouncementInput, type Announcement } from '../schema';

export const createAnnouncement = async (input: CreateAnnouncementInput): Promise<Announcement> => {
  try {
    // Insert announcement record
    const result = await db.insert(announcementsTable)
      .values({
        title: input.title,
        description: input.description,
        publish_date: input.publish_date,
        attachment_file: input.attachment_file || null,
        status: input.status
      })
      .returning()
      .execute();

    const announcement = result[0];
    return announcement;
  } catch (error) {
    console.error('Announcement creation failed:', error);
    throw error;
  }
};
