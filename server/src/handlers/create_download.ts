
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput, type Download } from '../schema';

export const createDownload = async (input: CreateDownloadInput): Promise<Download> => {
  try {
    // Insert download record
    const result = await db.insert(downloadsTable)
      .values({
        document_name: input.document_name,
        publisher: input.publisher,
        category: input.category,
        file_path: input.file_path,
        description: input.description,
        hits: 0, // Initialize hits to 0
        upload_date: new Date() // Set current date as upload_date
      })
      .returning()
      .execute();

    const download = result[0];
    return download;
  } catch (error) {
    console.error('Download creation failed:', error);
    throw error;
  }
};
