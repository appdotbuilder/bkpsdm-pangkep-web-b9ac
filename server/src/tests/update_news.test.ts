
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput, type UpdateNewsInput } from '../schema';
import { updateNews } from '../handlers/update_news';
import { eq } from 'drizzle-orm';

// Test data for creating initial news
const testNewsData: CreateNewsInput = {
  title: 'Original Title',
  content: 'Original content for testing',
  publish_date: new Date('2024-01-01'),
  author: 'Test Author',
  category: 'umum',
  featured_image: 'original-image.jpg',
  status: false
};

// Helper to create a test news record
const createTestNews = async () => {
  const result = await db.insert(newsTable)
    .values({
      title: testNewsData.title,
      content: testNewsData.content,
      publish_date: testNewsData.publish_date,
      author: testNewsData.author,
      category: testNewsData.category,
      featured_image: testNewsData.featured_image || null,
      status: testNewsData.status
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a news article with all fields', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      title: 'Updated Title',
      content: 'Updated content',
      publish_date: new Date('2024-02-01'),
      author: 'Updated Author',
      category: 'kepegawaian',
      featured_image: 'updated-image.jpg',
      status: true
    };

    const result = await updateNews(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdNews.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Updated content');
    expect(result!.publish_date).toEqual(new Date('2024-02-01'));
    expect(result!.author).toEqual('Updated Author');
    expect(result!.category).toEqual('kepegawaian');
    expect(result!.featured_image).toEqual('updated-image.jpg');
    expect(result!.status).toEqual(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > createdNews.updated_at).toBe(true);
  });

  it('should update news with partial fields', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      title: 'Partially Updated Title',
      status: true
    };

    const result = await updateNews(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partially Updated Title');
    expect(result!.status).toEqual(true);
    // Other fields should remain unchanged
    expect(result!.content).toEqual(testNewsData.content);
    expect(result!.author).toEqual(testNewsData.author);
    expect(result!.category).toEqual(testNewsData.category);
    expect(result!.featured_image).toEqual('original-image.jpg');
  });

  it('should handle nullable featured_image field', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      featured_image: null
    };

    const result = await updateNews(updateInput);

    expect(result).not.toBeNull();
    expect(result!.featured_image).toBeNull();
    expect(result!.title).toEqual(testNewsData.title); // Other fields unchanged
  });

  it('should update the record in the database', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      title: 'Database Updated Title',
      category: 'pengumuman'
    };

    await updateNews(updateInput);

    // Verify the update in the database
    const updatedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, createdNews.id))
      .execute();

    expect(updatedNews).toHaveLength(1);
    expect(updatedNews[0].title).toEqual('Database Updated Title');
    expect(updatedNews[0].category).toEqual('pengumuman');
    expect(updatedNews[0].updated_at > createdNews.updated_at).toBe(true);
  });

  it('should return null when news article does not exist', async () => {
    const updateInput: UpdateNewsInput = {
      id: 999,
      title: 'Non-existent News'
    };

    const result = await updateNews(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields are provided to update', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id
    };

    const result = await updateNews(updateInput);

    expect(result).toBeNull();
  });

  it('should update view_count field correctly', async () => {
    const createdNews = await createTestNews();

    // First verify initial view_count
    expect(createdNews.view_count).toEqual(0);

    // Update view_count through direct database update since it's not in UpdateNewsInput
    await db.update(newsTable)
      .set({ view_count: 5 })
      .where(eq(newsTable.id, createdNews.id))
      .execute();

    // Update other fields
    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      title: 'Title with view count test'
    };

    const result = await updateNews(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Title with view count test');
    expect(result!.view_count).toEqual(5); // Should preserve the view_count
  });

  it('should handle setting featured_image to null explicitly', async () => {
    const createdNews = await createTestNews();

    const updateInput: UpdateNewsInput = {
      id: createdNews.id,
      featured_image: null
    };

    const result = await updateNews(updateInput);

    expect(result).not.toBeNull();
    expect(result!.featured_image).toBeNull();

    // Verify in database
    const dbNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, createdNews.id))
      .execute();

    expect(dbNews[0].featured_image).toBeNull();
  });
});
