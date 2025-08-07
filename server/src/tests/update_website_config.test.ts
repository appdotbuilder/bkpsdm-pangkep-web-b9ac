
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { websiteConfigTable } from '../db/schema';
import { type UpdateWebsiteConfigInput } from '../schema';
import { updateWebsiteConfig } from '../handlers/update_website_config';
import { eq } from 'drizzle-orm';

describe('updateWebsiteConfig', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new website configuration when key does not exist', async () => {
    const input: UpdateWebsiteConfigInput = {
      key: 'header_logo',
      value: '/images/header-logo.png'
    };

    const result = await updateWebsiteConfig(input);

    expect(result).not.toBeNull();
    expect(result!.key).toBe('header_logo');
    expect(result!.value).toBe('/images/header-logo.png');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update existing website configuration', async () => {
    // Create initial configuration
    await db.insert(websiteConfigTable)
      .values({
        key: 'footer_logo',
        value: '/images/old-footer-logo.png'
      })
      .execute();

    const input: UpdateWebsiteConfigInput = {
      key: 'footer_logo',
      value: '/images/new-footer-logo.png'
    };

    const result = await updateWebsiteConfig(input);

    expect(result).not.toBeNull();
    expect(result!.key).toBe('footer_logo');
    expect(result!.value).toBe('/images/new-footer-logo.png');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save configuration to database correctly', async () => {
    const input: UpdateWebsiteConfigInput = {
      key: 'footer_content',
      value: 'Copyright 2024 Government Agency'
    };

    const result = await updateWebsiteConfig(input);

    // Verify in database
    const configs = await db.select()
      .from(websiteConfigTable)
      .where(eq(websiteConfigTable.id, result!.id))
      .execute();

    expect(configs).toHaveLength(1);
    expect(configs[0].key).toBe('footer_content');
    expect(configs[0].value).toBe('Copyright 2024 Government Agency');
    expect(configs[0].created_at).toBeInstanceOf(Date);
  });

  it('should update updated_at timestamp when modifying existing config', async () => {
    // Create initial configuration
    const initialResult = await db.insert(websiteConfigTable)
      .values({
        key: 'site_title',
        value: 'Old Title'
      })
      .returning()
      .execute();

    const originalUpdatedAt = initialResult[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateWebsiteConfigInput = {
      key: 'site_title',
      value: 'New Title'
    };

    const result = await updateWebsiteConfig(input);

    expect(result).not.toBeNull();
    expect(result!.value).toBe('New Title');
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle multiple configuration keys independently', async () => {
    const input1: UpdateWebsiteConfigInput = {
      key: 'header_logo',
      value: '/images/header.png'
    };

    const input2: UpdateWebsiteConfigInput = {
      key: 'footer_logo',
      value: '/images/footer.png'
    };

    const result1 = await updateWebsiteConfig(input1);
    const result2 = await updateWebsiteConfig(input2);

    expect(result1!.key).toBe('header_logo');
    expect(result1!.value).toBe('/images/header.png');
    expect(result2!.key).toBe('footer_logo');
    expect(result2!.value).toBe('/images/footer.png');

    // Verify both exist in database
    const allConfigs = await db.select().from(websiteConfigTable).execute();
    expect(allConfigs).toHaveLength(2);
  });
});
