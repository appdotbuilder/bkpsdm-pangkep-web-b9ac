
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput } from '../schema';
import { createNews } from '../handlers/create_news';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateNewsInput = {
  title: 'Breaking News: Test Article',
  content: 'This is a comprehensive test article content that covers various aspects of news reporting.',
  publish_date: new Date('2024-01-15'),
  author: 'Test Reporter',
  category: 'umum',
  featured_image: 'https://example.com/image.jpg',
  status: true
};

describe('createNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a news article', async () => {
    const result = await createNews(testInput);

    // Basic field validation
    expect(result.title).toEqual('Breaking News: Test Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.publish_date).toEqual(new Date('2024-01-15'));
    expect(result.author).toEqual('Test Reporter');
    expect(result.category).toEqual('umum');
    expect(result.featured_image).toEqual('https://example.com/image.jpg');
    expect(result.status).toEqual(true);
    expect(result.view_count).toEqual(0); // Should default to 0
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save news article to database', async () => {
    const result = await createNews(testInput);

    // Query using proper drizzle syntax
    const newsArticles = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, result.id))
      .execute();

    expect(newsArticles).toHaveLength(1);
    expect(newsArticles[0].title).toEqual('Breaking News: Test Article');
    expect(newsArticles[0].content).toEqual(testInput.content);
    expect(newsArticles[0].author).toEqual('Test Reporter');
    expect(newsArticles[0].category).toEqual('umum');
    expect(newsArticles[0].featured_image).toEqual('https://example.com/image.jpg');
    expect(newsArticles[0].status).toEqual(true);
    expect(newsArticles[0].view_count).toEqual(0);
    expect(newsArticles[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle null featured image', async () => {
    const inputWithoutImage: CreateNewsInput = {
      ...testInput,
      featured_image: null
    };

    const result = await createNews(inputWithoutImage);

    expect(result.featured_image).toBeNull();

    // Verify in database
    const newsArticles = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, result.id))
      .execute();

    expect(newsArticles[0].featured_image).toBeNull();
  });

  it('should handle draft status correctly', async () => {
    const draftInput: CreateNewsInput = {
      ...testInput,
      status: false
    };

    const result = await createNews(draftInput);

    expect(result.status).toEqual(false);

    // Verify in database
    const newsArticles = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, result.id))
      .execute();

    expect(newsArticles[0].status).toEqual(false);
  });

  it('should handle different news categories', async () => {
    const categories = ['umum', 'kepegawaian', 'pengembangan', 'pengumuman', 'kegiatan'] as const;

    for (const category of categories) {
      const categoryInput: CreateNewsInput = {
        ...testInput,
        title: `Test News - ${category}`,
        category
      };

      const result = await createNews(categoryInput);
      expect(result.category).toEqual(category);
      expect(result.title).toEqual(`Test News - ${category}`);
    }
  });
});
