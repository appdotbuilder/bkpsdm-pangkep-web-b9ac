
import { z } from 'zod';

// News Category enum
export const newsCategoryEnum = z.enum(['umum', 'kepegawaian', 'pengembangan', 'pengumuman', 'kegiatan']);
export type NewsCategory = z.infer<typeof newsCategoryEnum>;

// Download Category enum
export const downloadCategoryEnum = z.enum(['peraturan', 'formulir', 'panduan', 'laporan', 'lainnya']);
export type DownloadCategory = z.infer<typeof downloadCategoryEnum>;

// User Role enum
export const userRoleEnum = z.enum(['admin', 'editor']);
export type UserRole = z.infer<typeof userRoleEnum>;

// News schema
export const newsSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  publish_date: z.coerce.date(),
  author: z.string(),
  category: newsCategoryEnum,
  featured_image: z.string().nullable(),
  status: z.boolean(), // true = published, false = draft
  view_count: z.number().int().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type News = z.infer<typeof newsSchema>;

export const createNewsInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  publish_date: z.coerce.date(),
  author: z.string().min(1),
  category: newsCategoryEnum,
  featured_image: z.string().nullable().optional(),
  status: z.boolean().default(false)
});

export type CreateNewsInput = z.infer<typeof createNewsInputSchema>;

export const updateNewsInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  publish_date: z.coerce.date().optional(),
  author: z.string().min(1).optional(),
  category: newsCategoryEnum.optional(),
  featured_image: z.string().nullable().optional(),
  status: z.boolean().optional()
});

export type UpdateNewsInput = z.infer<typeof updateNewsInputSchema>;

// Announcement schema
export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  publish_date: z.coerce.date(),
  attachment_file: z.string().nullable(),
  status: z.boolean(), // true = active, false = inactive
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Announcement = z.infer<typeof announcementSchema>;

export const createAnnouncementInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publish_date: z.coerce.date(),
  attachment_file: z.string().nullable().optional(),
  status: z.boolean().default(true)
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementInputSchema>;

export const updateAnnouncementInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  publish_date: z.coerce.date().optional(),
  attachment_file: z.string().nullable().optional(),
  status: z.boolean().optional()
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementInputSchema>;

// Download Center schema
export const downloadSchema = z.object({
  id: z.number(),
  document_name: z.string(),
  publisher: z.string(),
  category: downloadCategoryEnum,
  hits: z.number().int().nonnegative(),
  file_path: z.string(),
  upload_date: z.coerce.date(),
  description: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Download = z.infer<typeof downloadSchema>;

export const createDownloadInputSchema = z.object({
  document_name: z.string().min(1),
  publisher: z.string().min(1),
  category: downloadCategoryEnum,
  file_path: z.string().min(1),
  description: z.string().min(1)
});

export type CreateDownloadInput = z.infer<typeof createDownloadInputSchema>;

export const updateDownloadInputSchema = z.object({
  id: z.number(),
  document_name: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  category: downloadCategoryEnum.optional(),
  file_path: z.string().min(1).optional(),
  description: z.string().min(1).optional()
});

export type UpdateDownloadInput = z.infer<typeof updateDownloadInputSchema>;

// Event/Agenda schema
export const eventSchema = z.object({
  id: z.number(),
  event_name: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  time: z.string(),
  location: z.string(),
  description: z.string(),
  organizer: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Event = z.infer<typeof eventSchema>;

export const createEventInputSchema = z.object({
  event_name: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  time: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  organizer: z.string().min(1)
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

export const updateEventInputSchema = z.object({
  id: z.number(),
  event_name: z.string().min(1).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  time: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  organizer: z.string().min(1).optional()
});

export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

// Static Content schema (for Visi Misi, Struktur Organisasi)
export const staticContentSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string(),
  content: z.string(),
  image_path: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type StaticContent = z.infer<typeof staticContentSchema>;

export const updateStaticContentInputSchema = z.object({
  key: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  image_path: z.string().nullable().optional()
});

export type UpdateStaticContentInput = z.infer<typeof updateStaticContentInputSchema>;

// Website Configuration schema
export const websiteConfigSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WebsiteConfig = z.infer<typeof websiteConfigSchema>;

export const updateWebsiteConfigInputSchema = z.object({
  key: z.string(),
  value: z.string()
});

export type UpdateWebsiteConfigInput = z.infer<typeof updateWebsiteConfigInputSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password_hash: z.string(),
  role: userRoleEnum,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleEnum
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: userRoleEnum.optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Query filters
export const newsFilterSchema = z.object({
  category: newsCategoryEnum.optional(),
  status: z.boolean().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type NewsFilter = z.infer<typeof newsFilterSchema>;

export const downloadFilterSchema = z.object({
  category: downloadCategoryEnum.optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type DownloadFilter = z.infer<typeof downloadFilterSchema>;
