
import { db } from '../db';
import { websiteConfigTable } from '../db/schema';
import { type WebsiteConfig } from '../schema';
import { eq } from 'drizzle-orm';

export const getWebsiteConfigByKey = async (key: string): Promise<WebsiteConfig | null> => {
  try {
    const result = await db.select()
      .from(websiteConfigTable)
      .where(eq(websiteConfigTable.key, key))
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Website config fetch by key failed:', error);
    throw error;
  }
};

export const getAllWebsiteConfig = async (): Promise<WebsiteConfig[]> => {
  try {
    const results = await db.select()
      .from(websiteConfigTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Website config fetch all failed:', error);
    throw error;
  }
};
