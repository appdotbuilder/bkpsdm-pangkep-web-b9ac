
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { staticContentTable } from '../db/schema';
import { type UpdateStaticContentInput } from '../schema';
import { updateStaticContent } from '../handlers/update_static_content';
import { eq } from 'drizzle-orm';

describe('updateStaticContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new static content when key does not exist', async () => {
    const input: UpdateStaticContentInput = {
      key: 'visi_misi',
      title: 'Visi dan Misi',
      content: 'Visi: Menjadi lembaga terdepan. Misi: Melayani dengan optimal.',
      image_path: '/uploads/visi-misi.jpg'
    };

    const result = await updateStaticContent(input);

    expect(result).toBeDefined();
    expect(result!.key).toEqual('visi_misi');
    expect(result!.title).toEqual('Visi dan Misi');
    expect(result!.content).toEqual('Visi: Menjadi lembaga terdepan. Misi: Melayani dengan optimal.');
    expect(result!.image_path).toEqual('/uploads/visi-misi.jpg');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update existing static content', async () => {
    // First create static content
    const initialData = {
      key: 'struktur_organisasi',
      title: 'Struktur Organisasi Lama',
      content: 'Konten struktur organisasi lama',
      image_path: null
    };

    await db.insert(staticContentTable)
      .values(initialData)
      .execute();

    // Update the content
    const updateInput: UpdateStaticContentInput = {
      key: 'struktur_organisasi',
      title: 'Struktur Organisasi Baru',
      content: 'Konten struktur organisasi yang telah diperbarui',
      image_path: '/uploads/struktur-baru.png'
    };

    const result = await updateStaticContent(updateInput);

    expect(result).toBeDefined();
    expect(result!.key).toEqual('struktur_organisasi');
    expect(result!.title).toEqual('Struktur Organisasi Baru');
    expect(result!.content).toEqual('Konten struktur organisasi yang telah diperbarui');
    expect(result!.image_path).toEqual('/uploads/struktur-baru.png');
  });

  it('should update only specified fields', async () => {
    // First create static content
    const initialData = {
      key: 'visi_misi',
      title: 'Visi dan Misi Original',
      content: 'Konten original',
      image_path: '/uploads/original.jpg'
    };

    await db.insert(staticContentTable)
      .values(initialData)
      .execute();

    // Update only title
    const updateInput: UpdateStaticContentInput = {
      key: 'visi_misi',
      title: 'Visi dan Misi Updated'
    };

    const result = await updateStaticContent(updateInput);

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Visi dan Misi Updated');
    expect(result!.content).toEqual('Konten original'); // Should remain unchanged
    expect(result!.image_path).toEqual('/uploads/original.jpg'); // Should remain unchanged
  });

  it('should save updated content to database', async () => {
    const input: UpdateStaticContentInput = {
      key: 'test_content',
      title: 'Test Content',
      content: 'This is test content',
      image_path: null
    };

    const result = await updateStaticContent(input);

    // Verify in database
    const saved = await db.select()
      .from(staticContentTable)
      .where(eq(staticContentTable.id, result!.id))
      .execute();

    expect(saved).toHaveLength(1);
    expect(saved[0].key).toEqual('test_content');
    expect(saved[0].title).toEqual('Test Content');
    expect(saved[0].content).toEqual('This is test content');
    expect(saved[0].image_path).toBeNull();
  });

  it('should handle null image_path correctly', async () => {
    // Create content with image
    const initialData = {
      key: 'test_key',
      title: 'Test Title',
      content: 'Test content',
      image_path: '/uploads/test.jpg'
    };

    await db.insert(staticContentTable)
      .values(initialData)
      .execute();

    // Update to remove image
    const updateInput: UpdateStaticContentInput = {
      key: 'test_key',
      image_path: null
    };

    const result = await updateStaticContent(updateInput);

    expect(result).toBeDefined();
    expect(result!.image_path).toBeNull();
    expect(result!.title).toEqual('Test Title'); // Should remain unchanged
  });

  it('should update timestamps correctly', async () => {
    // Create initial content
    const initialData = {
      key: 'timestamp_test',
      title: 'Original Title',
      content: 'Original content',
      image_path: null
    };

    const insertResult = await db.insert(staticContentTable)
      .values(initialData)
      .returning()
      .execute();

    const originalCreatedAt = insertResult[0].created_at;
    const originalUpdatedAt = insertResult[0].updated_at;

    // Wait a moment to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the content
    const updateInput: UpdateStaticContentInput = {
      key: 'timestamp_test',
      title: 'Updated Title'
    };

    const result = await updateStaticContent(updateInput);

    expect(result).toBeDefined();
    expect(result!.created_at).toEqual(originalCreatedAt); // Should remain unchanged
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime()); // Should be updated
  });
});
