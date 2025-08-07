
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput } from '../schema';
import { createDownload } from '../handlers/create_download';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateDownloadInput = {
  document_name: 'Test Document',
  publisher: 'Test Publisher',
  category: 'formulir',
  file_path: '/uploads/test-document.pdf',
  description: 'A test document for download testing'
};

describe('createDownload', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a download', async () => {
    const result = await createDownload(testInput);

    // Basic field validation
    expect(result.document_name).toEqual('Test Document');
    expect(result.publisher).toEqual('Test Publisher');
    expect(result.category).toEqual('formulir');
    expect(result.file_path).toEqual('/uploads/test-document.pdf');
    expect(result.description).toEqual('A test document for download testing');
    expect(result.hits).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.upload_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save download to database', async () => {
    const result = await createDownload(testInput);

    // Query using proper drizzle syntax
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, result.id))
      .execute();

    expect(downloads).toHaveLength(1);
    expect(downloads[0].document_name).toEqual('Test Document');
    expect(downloads[0].publisher).toEqual('Test Publisher');
    expect(downloads[0].category).toEqual('formulir');
    expect(downloads[0].file_path).toEqual('/uploads/test-document.pdf');
    expect(downloads[0].description).toEqual('A test document for download testing');
    expect(downloads[0].hits).toEqual(0);
    expect(downloads[0].upload_date).toBeInstanceOf(Date);
    expect(downloads[0].created_at).toBeInstanceOf(Date);
  });

  it('should initialize hits to zero', async () => {
    const result = await createDownload(testInput);

    expect(result.hits).toEqual(0);

    // Verify in database
    const downloads = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, result.id))
      .execute();

    expect(downloads[0].hits).toEqual(0);
  });

  it('should set upload_date to current time', async () => {
    const beforeCreate = new Date();
    const result = await createDownload(testInput);
    const afterCreate = new Date();

    // Check that upload_date is within reasonable time range
    expect(result.upload_date >= beforeCreate).toBe(true);
    expect(result.upload_date <= afterCreate).toBe(true);
  });
});
