
import { db } from '../db';
import { websiteConfigTable } from '../db/schema';
import { type UpdateWebsiteConfigInput, type WebsiteConfig } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWebsiteConfig = async (input: UpdateWebsiteConfigInput): Promise<WebsiteConfig | null> => {
  try {
    // First, try to update existing configuration
    const updateResult = await db.update(websiteConfigTable)
      .set({
        value: input.value,
        updated_at: new Date()
      })
      .where(eq(websiteConfigTable.key, input.key))
      .returning()
      .execute();

    // If record exists, return the updated config
    if (updateResult.length > 0) {
      return updateResult[0];
    }

    // If no record exists, create new one (upsert behavior)
    const insertResult = await db.insert(websiteConfigTable)
      .values({
        key: input.key,
        value: input.value
      })
      .returning()
      .execute();

    return insertResult[0];
  } catch (error) {
    console.error('Website config update failed:', error);
    throw error;
  }
};
