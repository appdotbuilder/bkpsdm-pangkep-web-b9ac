
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput } from '../schema';
import { deleteNews } from '../handlers/delete_news';
import { eq } from 'drizzle-orm';

// Test news input
const testNewsInput: CreateNewsInput = {
  title: 'Test News Article',
  content: 'This is test content for the news article',
  publish_date: new Date('2024-01-15'),
  author: 'Test Author',
  category: 'umum',
  featured_image: '/images/test.jpg',
  status: true
};

describe('deleteNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete existing news article', async () => {
    // Create a news article first
    const created = await db.insert(newsTable)
      .values({
        title: testNewsInput.title,
        content: testNewsInput.content,
        publish_date: testNewsInput.publish_date,
        author: testNewsInput.author,
        category: testNewsInput.category,
        featured_image: testNewsInput.featured_image,
        status: testNewsInput.status
      })
      .returning()
      .execute();

    const newsId = created[0].id;

    // Delete the news article
    const result = await deleteNews(newsId);

    expect(result).toBe(true);

    // Verify the article was deleted from database
    const deletedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, newsId))
      .execute();

    expect(deletedNews).toHaveLength(0);
  });

  it('should return false when deleting non-existent news article', async () => {
    const nonExistentId = 999;

    const result = await deleteNews(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other news articles when deleting one', async () => {
    // Create two news articles
    const firstNews = await db.insert(newsTable)
      .values({
        title: 'First News',
        content: 'First content',
        publish_date: new Date('2024-01-15'),
        author: 'Author 1',
        category: 'umum',
        status: true
      })
      .returning()
      .execute();

    const secondNews = await db.insert(newsTable)
      .values({
        title: 'Second News',
        content: 'Second content',
        publish_date: new Date('2024-01-16'),
        author: 'Author 2',
        category: 'kepegawaian',
        status: false
      })
      .returning()
      .execute();

    // Delete the first news article
    const result = await deleteNews(firstNews[0].id);

    expect(result).toBe(true);

    // Verify first article is deleted
    const deletedNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, firstNews[0].id))
      .execute();

    expect(deletedNews).toHaveLength(0);

    // Verify second article still exists
    const remainingNews = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, secondNews[0].id))
      .execute();

    expect(remainingNews).toHaveLength(1);
    expect(remainingNews[0].title).toBe('Second News');
  });
});
