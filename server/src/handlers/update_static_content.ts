
import { db } from '../db';
import { staticContentTable } from '../db/schema';
import { type UpdateStaticContentInput, type StaticContent } from '../schema';
import { eq } from 'drizzle-orm';

export const updateStaticContent = async (input: UpdateStaticContentInput): Promise<StaticContent | null> => {
  try {
    // Check if static content with this key exists
    const existing = await db.select()
      .from(staticContentTable)
      .where(eq(staticContentTable.key, input.key))
      .execute();

    let result;

    if (existing.length > 0) {
      // Update existing content
      const updateData: any = {
        updated_at: new Date()
      };

      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      if (input.content !== undefined) {
        updateData.content = input.content;
      }
      if (input.image_path !== undefined) {
        updateData.image_path = input.image_path;
      }

      const updateResult = await db.update(staticContentTable)
        .set(updateData)
        .where(eq(staticContentTable.key, input.key))
        .returning()
        .execute();

      result = updateResult[0];
    } else {
      // Insert new content (upsert behavior)
      const insertData = {
        key: input.key,
        title: input.title || '',
        content: input.content || '',
        image_path: input.image_path || null
      };

      const insertResult = await db.insert(staticContentTable)
        .values(insertData)
        .returning()
        .execute();

      result = insertResult[0];
    }

    return result || null;
  } catch (error) {
    console.error('Static content update failed:', error);
    throw error;
  }
};
