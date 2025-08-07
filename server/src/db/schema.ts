
import { serial, text, pgTable, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// Define enums
export const newsCategoryEnum = pgEnum('news_category', ['umum', 'kepegawaian', 'pengembangan', 'pengumuman', 'kegiatan']);
export const downloadCategoryEnum = pgEnum('download_category', ['peraturan', 'formulir', 'panduan', 'laporan', 'lainnya']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor']);

// News table
export const newsTable = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publish_date: timestamp('publish_date').notNull(),
  author: text('author').notNull(),
  category: newsCategoryEnum('category').notNull(),
  featured_image: text('featured_image'), // Nullable for optional featured image
  status: boolean('status').notNull().default(false), // false = draft, true = published
  view_count: integer('view_count').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Announcements table
export const announcementsTable = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  publish_date: timestamp('publish_date').notNull(),
  attachment_file: text('attachment_file'), // Nullable for optional attachment
  status: boolean('status').notNull().default(true), // true = active, false = inactive
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Downloads table
export const downloadsTable = pgTable('downloads', {
  id: serial('id').primaryKey(),
  document_name: text('document_name').notNull(),
  publisher: text('publisher').notNull(),
  category: downloadCategoryEnum('category').notNull(),
  hits: integer('hits').notNull().default(0),
  file_path: text('file_path').notNull(),
  upload_date: timestamp('upload_date').defaultNow().notNull(),
  description: text('description').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Events/Agenda table
export const eventsTable = pgTable('events', {
  id: serial('id').primaryKey(),
  event_name: text('event_name').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  organizer: text('organizer').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Static content table (for Visi Misi, Struktur Organisasi)
export const staticContentTable = pgTable('static_content', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // 'visi_misi', 'struktur_organisasi'
  title: text('title').notNull(),
  content: text('content').notNull(),
  image_path: text('image_path'), // Nullable for optional images
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Website configuration table
export const websiteConfigTable = pgTable('website_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // 'header_logo', 'footer_logo', 'footer_content'
  value: text('value').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Export all tables for relation queries
export const tables = {
  news: newsTable,
  announcements: announcementsTable,
  downloads: downloadsTable,
  events: eventsTable,
  staticContent: staticContentTable,
  websiteConfig: websiteConfigTable,
  users: usersTable,
};
