
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type Download, type DownloadFilter } from '../schema';
import { eq } from 'drizzle-orm';

export const getDownloads = async (filter?: DownloadFilter): Promise<Download[]> => {
  try {
    // Apply pagination defaults
    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    // Build query conditionally without reassignment
    if (filter?.category) {
      // Query with category filter
      const results = await db.select()
        .from(downloadsTable)
        .where(eq(downloadsTable.category, filter.category))
        .limit(limit)
        .offset(offset)
        .execute();
      
      return results;
    } else {
      // Query without filter
      const results = await db.select()
        .from(downloadsTable)
        .limit(limit)
        .offset(offset)
        .execute();
      
      return results;
    }
  } catch (error) {
    console.error('Failed to fetch downloads:', error);
    throw error;
  }
};

export const getDownloadById = async (id: number): Promise<Download | null> => {
  try {
    // First fetch the download
    const results = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const download = results[0];

    // Increment hits count
    await db.update(downloadsTable)
      .set({ hits: download.hits + 1 })
      .where(eq(downloadsTable.id, id))
      .execute();

    // Return the download with incremented hits
    return {
      ...download,
      hits: download.hits + 1
    };
  } catch (error) {
    console.error('Failed to fetch download by ID:', error);
    throw error;
  }
};
