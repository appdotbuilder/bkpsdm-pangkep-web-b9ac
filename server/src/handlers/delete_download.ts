
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteDownload = async (id: number): Promise<boolean> => {
  try {
    // Delete the download record
    const result = await db.delete(downloadsTable)
      .where(eq(downloadsTable.id, id))
      .execute();

    // Return true if a record was deleted, false if no record found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Download deletion failed:', error);
    throw error;
  }
};
