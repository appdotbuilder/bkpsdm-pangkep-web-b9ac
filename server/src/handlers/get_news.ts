
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type News, type NewsFilter } from '../schema';
import { eq, desc, and, SQL } from 'drizzle-orm';

export const getNews = async (filter?: NewsFilter): Promise<News[]> => {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    if (filter?.category) {
      conditions.push(eq(newsTable.category, filter.category));
    }

    if (filter?.status !== undefined) {
      conditions.push(eq(newsTable.status, filter.status));
    }

    // Build the complete query functionally without reassignment
    const baseQuery = db.select().from(newsTable);
    
    const withConditions = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;
    
    const withOrder = withConditions.orderBy(desc(newsTable.publish_date));
    
    // Handle pagination cases
    let finalQuery;
    if (filter?.limit && filter?.offset) {
      finalQuery = withOrder.limit(filter.limit).offset(filter.offset);
    } else if (filter?.limit) {
      finalQuery = withOrder.limit(filter.limit);
    } else if (filter?.offset) {
      finalQuery = withOrder.offset(filter.offset);
    } else {
      finalQuery = withOrder;
    }

    const results = await finalQuery.execute();
    return results;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
};

export const getNewsById = async (id: number): Promise<News | null> => {
  try {
    // First, get the news article
    const results = await db.select()
      .from(newsTable)
      .where(eq(newsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const news = results[0];

    // Increment view count
    await db.update(newsTable)
      .set({ view_count: news.view_count + 1 })
      .where(eq(newsTable.id, id))
      .execute();

    // Return the news with incremented view count
    return {
      ...news,
      view_count: news.view_count + 1
    };
  } catch (error) {
    console.error('Failed to fetch news by ID:', error);
    throw error;
  }
};

export const getPopularNews = async (limit: number = 5): Promise<News[]> => {
  try {
    const results = await db.select()
      .from(newsTable)
      .orderBy(desc(newsTable.view_count))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch popular news:', error);
    throw error;
  }
};

export const getLatestNews = async (limit: number = 5): Promise<News[]> => {
  try {
    const results = await db.select()
      .from(newsTable)
      .where(eq(newsTable.status, true)) // Only published articles
      .orderBy(desc(newsTable.publish_date))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch latest news:', error);
    throw error;
  }
};
