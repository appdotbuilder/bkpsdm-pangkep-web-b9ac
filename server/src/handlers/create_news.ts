
import { db } from '../db';
import { newsTable } from '../db/schema';
import { type CreateNewsInput, type News } from '../schema';

export const createNews = async (input: CreateNewsInput): Promise<News> => {
  try {
    // Insert news record
    const result = await db.insert(newsTable)
      .values({
        title: input.title,
        content: input.content,
        publish_date: input.publish_date,
        author: input.author,
        category: input.category,
        featured_image: input.featured_image || null,
        status: input.status // defaults to false if not provided in schema
      })
      .returning()
      .execute();

    const news = result[0];
    return news;
  } catch (error) {
    console.error('News creation failed:', error);
    throw error;
  }
};
