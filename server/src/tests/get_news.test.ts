
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type NewsFilter } from '../schema';
import { getNews, getNewsById, getPopularNews, getLatestNews } from '../handlers/get_news';
import { eq } from 'drizzle-orm';

// Test data helper - directly insert with all required fields
const createTestNews = async (overrides: Record<string, any> = {}): Promise<number> => {
  const defaultNews = {
    title: 'Test News',
    content: 'Test content',
    publish_date: new Date('2024-01-01'),
    author: 'Test Author',
    category: 'umum' as const,
    status: true,
    view_count: 0,
    featured_image: null,
    ...overrides
  };

  const result = await db.insert(newsTable)
    .values(defaultNews)
    .returning()
    .execute();

  return result[0].id;
};

describe('getNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all news when no filter is provided', async () => {
    await createTestNews({ title: 'News 1', publish_date: new Date('2024-01-01') });
    await createTestNews({ title: 'News 2', publish_date: new Date('2024-01-02') });

    const result = await getNews();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('News 2'); // Most recent first
    expect(result[1].title).toEqual('News 1');
  });

  it('should filter by category', async () => {
    await createTestNews({ category: 'umum' });
    await createTestNews({ category: 'kepegawaian' });

    const filter: NewsFilter = { category: 'kepegawaian' };
    const result = await getNews(filter);

    expect(result).toHaveLength(1);
    expect(result[0].category).toEqual('kepegawaian');
  });

  it('should filter by status', async () => {
    await createTestNews({ status: true });
    await createTestNews({ status: false });

    const filter: NewsFilter = { status: false };
    const result = await getNews(filter);

    expect(result).toHaveLength(1);
    expect(result[0].status).toEqual(false);
  });

  it('should apply pagination with limit and offset', async () => {
    await createTestNews({ title: 'News 1', publish_date: new Date('2024-01-01') });
    await createTestNews({ title: 'News 2', publish_date: new Date('2024-01-02') });
    await createTestNews({ title: 'News 3', publish_date: new Date('2024-01-03') });

    const filter: NewsFilter = { limit: 2, offset: 1 };
    const result = await getNews(filter);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('News 2');
    expect(result[1].title).toEqual('News 1');
  });

  it('should combine multiple filters', async () => {
    await createTestNews({ category: 'umum', status: true });
    await createTestNews({ category: 'umum', status: false });
    await createTestNews({ category: 'kepegawaian', status: true });

    const filter: NewsFilter = { category: 'umum', status: true };
    const result = await getNews(filter);

    expect(result).toHaveLength(1);
    expect(result[0].category).toEqual('umum');
    expect(result[0].status).toEqual(true);
  });
});

describe('getNewsById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return news by id and increment view count', async () => {
    const id = await createTestNews({ title: 'Test News', view_count: 5 });

    const result = await getNewsById(id);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test News');
    expect(result!.view_count).toEqual(6); // Incremented from 5 to 6

    // Verify view count was updated in database
    const updated = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, id))
      .execute();
    expect(updated[0].view_count).toEqual(6);
  });

  it('should return null for non-existent id', async () => {
    const result = await getNewsById(999);

    expect(result).toBeNull();
  });

  it('should increment view count from 0', async () => {
    const id = await createTestNews({ view_count: 0 });

    const result = await getNewsById(id);

    expect(result!.view_count).toEqual(1);
  });
});

describe('getPopularNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return news ordered by view count descending', async () => {
    await createTestNews({ title: 'Low Views', view_count: 5 });
    await createTestNews({ title: 'High Views', view_count: 50 });
    await createTestNews({ title: 'Medium Views', view_count: 25 });

    const result = await getPopularNews();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('High Views');
    expect(result[1].title).toEqual('Medium Views');
    expect(result[2].title).toEqual('Low Views');
  });

  it('should apply limit parameter', async () => {
    await createTestNews({ title: 'News 1', view_count: 10 });
    await createTestNews({ title: 'News 2', view_count: 20 });
    await createTestNews({ title: 'News 3', view_count: 30 });

    const result = await getPopularNews(2);

    expect(result).toHaveLength(2);
    expect(result[0].view_count).toEqual(30);
    expect(result[1].view_count).toEqual(20);
  });

  it('should use default limit of 5', async () => {
    // Create 7 news articles
    for (let i = 1; i <= 7; i++) {
      await createTestNews({ title: `News ${i}`, view_count: i });
    }

    const result = await getPopularNews();

    expect(result).toHaveLength(5);
  });
});

describe('getLatestNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only published news ordered by publish date descending', async () => {
    await createTestNews({ title: 'Draft News', status: false, publish_date: new Date('2024-01-03') });
    await createTestNews({ title: 'Old Published', status: true, publish_date: new Date('2024-01-01') });
    await createTestNews({ title: 'Recent Published', status: true, publish_date: new Date('2024-01-02') });

    const result = await getLatestNews();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Recent Published');
    expect(result[1].title).toEqual('Old Published');
    // Draft news should not be included
    expect(result.every(news => news.status === true)).toBe(true);
  });

  it('should apply limit parameter', async () => {
    await createTestNews({ title: 'News 1', status: true, publish_date: new Date('2024-01-01') });
    await createTestNews({ title: 'News 2', status: true, publish_date: new Date('2024-01-02') });
    await createTestNews({ title: 'News 3', status: true, publish_date: new Date('2024-01-03') });

    const result = await getLatestNews(2);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('News 3');
    expect(result[1].title).toEqual('News 2');
  });

  it('should use default limit of 5', async () => {
    // Create 7 published news articles
    for (let i = 1; i <= 7; i++) {
      await createTestNews({ 
        title: `News ${i}`, 
        status: true, 
        publish_date: new Date(`2024-01-${String(i).padStart(2, '0')}`)
      });
    }

    const result = await getLatestNews();

    expect(result).toHaveLength(5);
  });

  it('should return empty array when no published news exist', async () => {
    await createTestNews({ status: false });

    const result = await getLatestNews();

    expect(result).toHaveLength(0);
  });
});
