
import { db } from '../db';
import { newsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteNews = async (id: number): Promise<boolean> => {
  try {
    // Delete the news article
    const result = await db.delete(newsTable)
      .where(eq(newsTable.id, id))
      .execute();

    // Return true if a record was deleted, false if no record was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('News deletion failed:', error);
    throw error;
  }
};
