
import { db } from '../db';
import { staticContentTable } from '../db/schema';
import { type StaticContent } from '../schema';
import { eq } from 'drizzle-orm';

export const getStaticContentByKey = async (key: string): Promise<StaticContent | null> => {
  try {
    const results = await db.select()
      .from(staticContentTable)
      .where(eq(staticContentTable.key, key))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Static content fetch by key failed:', error);
    throw error;
  }
};

export const getAllStaticContent = async (): Promise<StaticContent[]> => {
  try {
    const results = await db.select()
      .from(staticContentTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Static content fetch all failed:', error);
    throw error;
  }
};
