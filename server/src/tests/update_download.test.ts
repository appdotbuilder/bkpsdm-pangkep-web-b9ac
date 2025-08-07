
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput, type UpdateDownloadInput } from '../schema';
import { updateDownload } from '../handlers/update_download';
import { eq } from 'drizzle-orm';

// Helper to create a test download
const createTestDownload = async () => {
  const testInput: CreateDownloadInput = {
    document_name: 'Test Document',
    publisher: 'Test Publisher',
    category: 'peraturan',
    file_path: '/path/to/test.pdf',
    description: 'Test description'
  };

  const result = await db.insert(downloadsTable)
    .values({
      ...testInput,
      upload_date: new Date()
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a download with all fields', async () => {
    const existingDownload = await createTestDownload();

    const updateInput: UpdateDownloadInput = {
      id: existingDownload.id,
      document_name: 'Updated Document',
      publisher: 'Updated Publisher',
      category: 'formulir',
      file_path: '/path/to/updated.pdf',
      description: 'Updated description'
    };

    const result = await updateDownload(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(existingDownload.id);
    expect(result!.document_name).toEqual('Updated Document');
    expect(result!.publisher).toEqual('Updated Publisher');
    expect(result!.category).toEqual('formulir');
    expect(result!.file_path).toEqual('/path/to/updated.pdf');
    expect(result!.description).toEqual('Updated description');
    expect(result!.hits).toEqual(existingDownload.hits); // Should remain unchanged
    expect(result!.created_at).toEqual(existingDownload.created_at);
    expect(result!.updated_at.getTime()).toBeGreaterThan(existingDownload.updated_at!.getTime());
  });

  it('should update a download with partial fields', async () => {
    const existingDownload = await createTestDownload();

    const updateInput: UpdateDownloadInput = {
      id: existingDownload.id,
      document_name: 'Partially Updated Document',
      category: 'panduan'
    };

    const result = await updateDownload(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(existingDownload.id);
    expect(result!.document_name).toEqual('Partially Updated Document');
    expect(result!.publisher).toEqual(existingDownload.publisher); // Should remain unchanged
    expect(result!.category).toEqual('panduan');
    expect(result!.file_path).toEqual(existingDownload.file_path); // Should remain unchanged
    expect(result!.description).toEqual(existingDownload.description); // Should remain unchanged
    expect(result!.updated_at.getTime()).toBeGreaterThan(existingDownload.updated_at!.getTime());
  });

  it('should save updated download to database', async () => {
    const existingDownload = await createTestDownload();

    const updateInput: UpdateDownloadInput = {
      id: existingDownload.id,
      document_name: 'Database Updated Document',
      description: 'Database updated description'
    };

    await updateDownload(updateInput);

    // Query database to verify changes
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, existingDownload.id))
      .execute();

    expect(downloads).toHaveLength(1);
    expect(downloads[0].document_name).toEqual('Database Updated Document');
    expect(downloads[0].description).toEqual('Database updated description');
    expect(downloads[0].publisher).toEqual(existingDownload.publisher); // Unchanged
    expect(downloads[0].updated_at.getTime()).toBeGreaterThan(existingDownload.updated_at!.getTime());
  });

  it('should return null when download does not exist', async () => {
    const updateInput: UpdateDownloadInput = {
      id: 999, // Non-existent ID
      document_name: 'Non-existent Document'
    };

    const result = await updateDownload(updateInput);

    expect(result).toBeNull();
  });

  it('should update only the updated_at timestamp when no fields provided', async () => {
    const existingDownload = await createTestDownload();

    const updateInput: UpdateDownloadInput = {
      id: existingDownload.id
    };

    const result = await updateDownload(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(existingDownload.id);
    expect(result!.document_name).toEqual(existingDownload.document_name);
    expect(result!.publisher).toEqual(existingDownload.publisher);
    expect(result!.category).toEqual(existingDownload.category);
    expect(result!.file_path).toEqual(existingDownload.file_path);
    expect(result!.description).toEqual(existingDownload.description);
    expect(result!.updated_at.getTime()).toBeGreaterThan(existingDownload.updated_at!.getTime());
  });
});
