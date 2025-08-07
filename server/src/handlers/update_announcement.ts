
import { db } from '../db';
import { announcementsTable } from '../db/schema';
import { type UpdateAnnouncementInput, type Announcement } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const updateAnnouncement = async (input: UpdateAnnouncementInput): Promise<Announcement | null> => {
  try {
    const { id, ...updateData } = input;

    // Build the update object only with provided fields
    const updateFields: any = {};
    
    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }
    
    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }
    
    if (updateData.publish_date !== undefined) {
      updateFields.publish_date = updateData.publish_date;
    }
    
    if (updateData.attachment_file !== undefined) {
      updateFields.attachment_file = updateData.attachment_file;
    }
    
    if (updateData.status !== undefined) {
      updateFields.status = updateData.status;
    }

    // Always update the updated_at timestamp
    updateFields.updated_at = sql`now()`;

    // Update the announcement record
    const result = await db.update(announcementsTable)
      .set(updateFields)
      .where(eq(announcementsTable.id, id))
      .returning()
      .execute();

    // Return the updated announcement or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Announcement update failed:', error);
    throw error;
  }
};
