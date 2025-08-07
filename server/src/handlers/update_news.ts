
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type UpdateNewsInput, type News } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const updateNews = async (input: UpdateNewsInput): Promise<News | null> => {
  try {
    // Extract ID from input and prepare update data
    const { id, ...updateData } = input;

    // Build the update object only with provided fields
    const updateFields: any = {};
    
    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }
    if (updateData.content !== undefined) {
      updateFields.content = updateData.content;
    }
    if (updateData.publish_date !== undefined) {
      updateFields.publish_date = updateData.publish_date;
    }
    if (updateData.author !== undefined) {
      updateFields.author = updateData.author;
    }
    if (updateData.category !== undefined) {
      updateFields.category = updateData.category;
    }
    if (updateData.featured_image !== undefined) {
      updateFields.featured_image = updateData.featured_image;
    }
    if (updateData.status !== undefined) {
      updateFields.status = updateData.status;
    }

    // Always update the updated_at timestamp
    updateFields.updated_at = sql`now()`;

    // If no fields to update, return null
    if (Object.keys(updateFields).length === 1) { // Only updated_at
      return null;
    }

    // Update the news record
    const result = await db.update(newsTable)
      .set(updateFields)
      .where(eq(newsTable.id, id))
      .returning()
      .execute();

    // Return the updated record or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('News update failed:', error);
    throw error;
  }
};
