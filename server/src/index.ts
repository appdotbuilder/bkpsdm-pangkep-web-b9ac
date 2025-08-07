
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createNewsInputSchema, 
  updateNewsInputSchema, 
  newsFilterSchema,
  createAnnouncementInputSchema,
  updateAnnouncementInputSchema,
  createDownloadInputSchema,
  updateDownloadInputSchema,
  downloadFilterSchema,
  createEventInputSchema,
  updateEventInputSchema,
  updateStaticContentInputSchema,
  updateWebsiteConfigInputSchema,
  createUserInputSchema,
  updateUserInputSchema
} from './schema';

// Import handlers
import { createNews } from './handlers/create_news';
import { getNews, getNewsById, getPopularNews, getLatestNews } from './handlers/get_news';
import { updateNews } from './handlers/update_news';
import { deleteNews } from './handlers/delete_news';

import { createAnnouncement } from './handlers/create_announcement';
import { getAnnouncements, getAnnouncementById, getAllAnnouncements } from './handlers/get_announcements';
import { updateAnnouncement } from './handlers/update_announcement';
import { deleteAnnouncement } from './handlers/delete_announcement';

import { createDownload } from './handlers/create_download';
import { getDownloads, getDownloadById } from './handlers/get_downloads';
import { updateDownload } from './handlers/update_download';
import { deleteDownload } from './handlers/delete_download';

import { createEvent } from './handlers/create_event';
import { getEvents, getUpcomingEvents, getEventById } from './handlers/get_events';
import { updateEvent } from './handlers/update_event';
import { deleteEvent } from './handlers/delete_event';

import { getStaticContentByKey, getAllStaticContent } from './handlers/get_static_content';
import { updateStaticContent } from './handlers/update_static_content';

import { getWebsiteConfigByKey, getAllWebsiteConfig } from './handlers/get_website_config';
import { updateWebsiteConfig } from './handlers/update_website_config';

import { createUser } from './handlers/create_user';
import { getUsers, getUserById, getUserByUsername } from './handlers/get_users';
import { updateUser } from './handlers/update_user';
import { deleteUser } from './handlers/delete_user';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // News routes
  createNews: publicProcedure
    .input(createNewsInputSchema)
    .mutation(({ input }) => createNews(input)),
  
  getNews: publicProcedure
    .input(newsFilterSchema.optional())
    .query(({ input }) => getNews(input)),
  
  getNewsById: publicProcedure
    .input(z.number())
    .query(({ input }) => getNewsById(input)),
  
  getPopularNews: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getPopularNews(input)),
  
  getLatestNews: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getLatestNews(input)),
  
  updateNews: publicProcedure
    .input(updateNewsInputSchema)
    .mutation(({ input }) => updateNews(input)),
  
  deleteNews: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteNews(input)),

  // Announcement routes
  createAnnouncement: publicProcedure
    .input(createAnnouncementInputSchema)
    .mutation(({ input }) => createAnnouncement(input)),
  
  getAnnouncements: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => getAnnouncements(input?.limit, input?.offset)),
  
  getAnnouncementById: publicProcedure
    .input(z.number())
    .query(({ input }) => getAnnouncementById(input)),
  
  getAllAnnouncements: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => getAllAnnouncements(input?.limit, input?.offset)),
  
  updateAnnouncement: publicProcedure
    .input(updateAnnouncementInputSchema)
    .mutation(({ input }) => updateAnnouncement(input)),
  
  deleteAnnouncement: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteAnnouncement(input)),

  // Download routes
  createDownload: publicProcedure
    .input(createDownloadInputSchema)
    .mutation(({ input }) => createDownload(input)),
  
  getDownloads: publicProcedure
    .input(downloadFilterSchema.optional())
    .query(({ input }) => getDownloads(input)),
  
  getDownloadById: publicProcedure
    .input(z.number())
    .query(({ input }) => getDownloadById(input)),
  
  updateDownload: publicProcedure
    .input(updateDownloadInputSchema)
    .mutation(({ input }) => updateDownload(input)),
  
  deleteDownload: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteDownload(input)),

  // Event routes
  createEvent: publicProcedure
    .input(createEventInputSchema)
    .mutation(({ input }) => createEvent(input)),
  
  getEvents: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => getEvents(input?.limit, input?.offset)),
  
  getUpcomingEvents: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getUpcomingEvents(input)),
  
  getEventById: publicProcedure
    .input(z.number())
    .query(({ input }) => getEventById(input)),
  
  updateEvent: publicProcedure
    .input(updateEventInputSchema)
    .mutation(({ input }) => updateEvent(input)),
  
  deleteEvent: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteEvent(input)),

  // Static content routes
  getStaticContentByKey: publicProcedure
    .input(z.string())
    .query(({ input }) => getStaticContentByKey(input)),
  
  getAllStaticContent: publicProcedure
    .query(() => getAllStaticContent()),
  
  updateStaticContent: publicProcedure
    .input(updateStaticContentInputSchema)
    .mutation(({ input }) => updateStaticContent(input)),

  // Website config routes
  getWebsiteConfigByKey: publicProcedure
    .input(z.string())
    .query(({ input }) => getWebsiteConfigByKey(input)),
  
  getAllWebsiteConfig: publicProcedure
    .query(() => getAllWebsiteConfig()),
  
  updateWebsiteConfig: publicProcedure
    .input(updateWebsiteConfigInputSchema)
    .mutation(({ input }) => updateWebsiteConfig(input)),

  // User routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getUsers: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => getUsers(input?.limit, input?.offset)),
  
  getUserById: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserById(input)),
  
  getUserByUsername: publicProcedure
    .input(z.string())
    .query(({ input }) => getUserByUsername(input)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),
  
  deleteUser: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteUser(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
