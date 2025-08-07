
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type UpdateDownloadInput, type Download } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDownload = async (input: UpdateDownloadInput): Promise<Download | null> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof downloadsTable.$inferInsert> = {};
    
    if (input.document_name !== undefined) {
      updateData.document_name = input.document_name;
    }
    if (input.publisher !== undefined) {
      updateData.publisher = input.publisher;
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.file_path !== undefined) {
      updateData.file_path = input.file_path;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the download record
    const result = await db.update(downloadsTable)
      .set(updateData)
      .where(eq(downloadsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no record was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Download update failed:', error);
    throw error;
  }
};
