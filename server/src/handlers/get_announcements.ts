
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type Announcement } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getAnnouncements = async (limit = 10, offset = 0): Promise<Announcement[]> => {
  try {
    // Fetch active announcements for public view, ordered by publish_date descending
    const results = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.status, true))
      .orderBy(desc(announcementsTable.publish_date))
      .limit(limit)
      .offset(offset)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    throw error;
  }
};

export const getAnnouncementById = async (id: number): Promise<Announcement | null> => {
  try {
    const results = await db.select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, id))
      .execute();

    return results[0] || null;
  } catch (error) {
    console.error('Failed to fetch announcement by ID:', error);
    throw error;
  }
};

export const getAllAnnouncements = async (limit = 10, offset = 0): Promise<Announcement[]> => {
  try {
    // Fetch all announcements for admin panel (including inactive), ordered by created_at descending
    const results = await db.select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.created_at))
      .limit(limit)
      .offset(offset)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch all announcements:', error);
    throw error;
  }
};
