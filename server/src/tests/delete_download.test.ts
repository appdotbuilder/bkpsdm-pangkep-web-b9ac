
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput } from '../schema';
import { deleteDownload } from '../handlers/delete_download';
import { eq } from 'drizzle-orm';

// Test download input
const testDownloadInput: CreateDownloadInput = {
  document_name: 'Test Document',
  publisher: 'Test Publisher',
  category: 'peraturan',
  file_path: '/uploads/test-document.pdf',
  description: 'A test document for deletion testing'
};

describe('deleteDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing download', async () => {
    // Create a download record first
    const createResult = await db.insert(downloadsTable)
      .values({
        document_name: testDownloadInput.document_name,
        publisher: testDownloadInput.publisher,
        category: testDownloadInput.category,
        file_path: testDownloadInput.file_path,
        description: testDownloadInput.description
      })
      .returning()
      .execute();

    const downloadId = createResult[0].id;

    // Delete the download
    const result = await deleteDownload(downloadId);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the record is deleted from database
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId))
      .execute();

    expect(downloads).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent download', async () => {
    // Try to delete a download that doesn't exist
    const result = await deleteDownload(999);

    // Should return false since no record was found
    expect(result).toBe(false);
  });

  it('should not affect other downloads when deleting one', async () => {
    // Create multiple download records
    const createResult1 = await db.insert(downloadsTable)
      .values({
        document_name: 'Document 1',
        publisher: testDownloadInput.publisher,
        category: testDownloadInput.category,
        file_path: '/uploads/document1.pdf',
        description: testDownloadInput.description
      })
      .returning()
      .execute();

    const createResult2 = await db.insert(downloadsTable)
      .values({
        document_name: 'Document 2',
        publisher: testDownloadInput.publisher,
        category: 'formulir',
        file_path: '/uploads/document2.pdf',
        description: testDownloadInput.description
      })
      .returning()
      .execute();

    const downloadId1 = createResult1[0].id;
    const downloadId2 = createResult2[0].id;

    // Delete only the first download
    const result = await deleteDownload(downloadId1);

    expect(result).toBe(true);

    // Verify first download is deleted
    const deletedDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId1))
      .execute();

    expect(deletedDownload).toHaveLength(0);

    // Verify second download still exists
    const remainingDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId2))
      .execute();

    expect(remainingDownload).toHaveLength(1);
    expect(remainingDownload[0].document_name).toEqual('Document 2');
  });

  it('should handle multiple deletion attempts on same record', async () => {
    // Create a download record
    const createResult = await db.insert(downloadsTable)
      .values({
        document_name: testDownloadInput.document_name,
        publisher: testDownloadInput.publisher,
        category: testDownloadInput.category,
        file_path: testDownloadInput.file_path,
        description: testDownloadInput.description
      })
      .returning()
      .execute();

    const downloadId = createResult[0].id;

    // First deletion should succeed
    const firstResult = await deleteDownload(downloadId);
    expect(firstResult).toBe(true);

    // Second deletion attempt should return false (record already deleted)
    const secondResult = await deleteDownload(downloadId);
    expect(secondResult).toBe(false);
  });
});
