
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { downloadsTable } from '../db/schema';
import { type CreateDownloadInput, type DownloadFilter } from '../schema';
import { getDownloads, getDownloadById } from '../handlers/get_downloads';
import { eq } from 'drizzle-orm';

const testDownload1: CreateDownloadInput = {
  document_name: 'Test Document 1',
  publisher: 'Test Publisher 1',
  category: 'peraturan',
  file_path: '/files/test1.pdf',
  description: 'Test description 1'
};

const testDownload2: CreateDownloadInput = {
  document_name: 'Test Document 2',
  publisher: 'Test Publisher 2',
  category: 'formulir',
  file_path: '/files/test2.pdf',
  description: 'Test description 2'
};

describe('getDownloads', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all downloads when no filter is provided', async () => {
    // Create test data
    await db.insert(downloadsTable).values([
      testDownload1,
      testDownload2
    ]).execute();

    const results = await getDownloads();

    expect(results).toHaveLength(2);
    expect(results[0].document_name).toBe('Test Document 1');
    expect(results[1].document_name).toBe('Test Document 2');
    expect(results[0].hits).toBe(0);
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter downloads by category', async () => {
    // Create test data
    await db.insert(downloadsTable).values([
      testDownload1, // peraturan
      testDownload2  // formulir
    ]).execute();

    const filter: DownloadFilter = {
      category: 'peraturan'
    };

    const results = await getDownloads(filter);

    expect(results).toHaveLength(1);
    expect(results[0].document_name).toBe('Test Document 1');
    expect(results[0].category).toBe('peraturan');
  });

  it('should apply pagination correctly', async () => {
    // Create multiple test downloads
    const downloads = Array.from({ length: 5 }, (_, i) => ({
      document_name: `Document ${i + 1}`,
      publisher: `Publisher ${i + 1}`,
      category: 'peraturan' as const,
      file_path: `/files/test${i + 1}.pdf`,
      description: `Description ${i + 1}`
    }));

    await db.insert(downloadsTable).values(downloads).execute();

    const filter: DownloadFilter = {
      limit: 2,
      offset: 1
    };

    const results = await getDownloads(filter);

    expect(results).toHaveLength(2);
    expect(results[0].document_name).toBe('Document 2');
    expect(results[1].document_name).toBe('Document 3');
  });

  it('should return empty array when no downloads match filter', async () => {
    // Create test data
    await db.insert(downloadsTable).values([testDownload1]).execute();

    const filter: DownloadFilter = {
      category: 'laporan'
    };

    const results = await getDownloads(filter);

    expect(results).toHaveLength(0);
  });
});

describe('getDownloadById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return download by ID and increment hits', async () => {
    // Create test data
    const insertResult = await db.insert(downloadsTable)
      .values(testDownload1)
      .returning()
      .execute();

    const downloadId = insertResult[0].id;
    const initialHits = insertResult[0].hits;

    const result = await getDownloadById(downloadId);

    expect(result).not.toBeNull();
    expect(result!.document_name).toBe('Test Document 1');
    expect(result!.hits).toBe(initialHits + 1);
    expect(result!.id).toBe(downloadId);

    // Verify hits were actually incremented in database
    const updatedDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId))
      .execute();

    expect(updatedDownload[0].hits).toBe(initialHits + 1);
  });

  it('should return null when download does not exist', async () => {
    const result = await getDownloadById(999);

    expect(result).toBeNull();
  });

  it('should increment hits multiple times', async () => {
    // Create test data
    const insertResult = await db.insert(downloadsTable)
      .values(testDownload1)
      .returning()
      .execute();

    const downloadId = insertResult[0].id;

    // Call multiple times
    await getDownloadById(downloadId);
    const result = await getDownloadById(downloadId);

    expect(result!.hits).toBe(2);

    // Verify in database
    const updatedDownload = await db.select()
      .from(downloadsTable)
      .where(eq(downloadsTable.id, downloadId))
      .execute();

    expect(updatedDownload[0].hits).toBe(2);
  });
});
