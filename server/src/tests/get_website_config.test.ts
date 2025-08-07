
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { websiteConfigTable } from '../db/schema';
import { getWebsiteConfigByKey, getAllWebsiteConfig } from '../handlers/get_website_config';

describe('getWebsiteConfigByKey', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return website config by key', async () => {
    // Create test data
    await db.insert(websiteConfigTable)
      .values({
        key: 'header_logo',
        value: 'logo.png'
      })
      .execute();

    const result = await getWebsiteConfigByKey('header_logo');

    expect(result).not.toBeNull();
    expect(result!.key).toEqual('header_logo');
    expect(result!.value).toEqual('logo.png');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent key', async () => {
    const result = await getWebsiteConfigByKey('non_existent_key');

    expect(result).toBeNull();
  });

  it('should return correct config when multiple configs exist', async () => {
    // Create multiple test configs
    await db.insert(websiteConfigTable)
      .values([
        { key: 'header_logo', value: 'header.png' },
        { key: 'footer_logo', value: 'footer.png' },
        { key: 'footer_content', value: 'Footer text content' }
      ])
      .execute();

    const result = await getWebsiteConfigByKey('footer_content');

    expect(result).not.toBeNull();
    expect(result!.key).toEqual('footer_content');
    expect(result!.value).toEqual('Footer text content');
  });
});

describe('getAllWebsiteConfig', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all website configs', async () => {
    // Create test data
    await db.insert(websiteConfigTable)
      .values([
        { key: 'header_logo', value: 'header.png' },
        { key: 'footer_logo', value: 'footer.png' },
        { key: 'footer_content', value: 'Footer text content' }
      ])
      .execute();

    const results = await getAllWebsiteConfig();

    expect(results).toHaveLength(3);
    
    // Check that all configs are returned
    const keys = results.map(config => config.key);
    expect(keys).toContain('header_logo');
    expect(keys).toContain('footer_logo');
    expect(keys).toContain('footer_content');

    // Verify structure of each config
    results.forEach(config => {
      expect(config.id).toBeDefined();
      expect(config.key).toBeDefined();
      expect(config.value).toBeDefined();
      expect(config.created_at).toBeInstanceOf(Date);
      expect(config.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no configs exist', async () => {
    const results = await getAllWebsiteConfig();

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return configs in insertion order', async () => {
    // Create test data in specific order
    await db.insert(websiteConfigTable)
      .values({ key: 'first_config', value: 'first_value' })
      .execute();

    await db.insert(websiteConfigTable)
      .values({ key: 'second_config', value: 'second_value' })
      .execute();

    const results = await getAllWebsiteConfig();

    expect(results).toHaveLength(2);
    expect(results[0].key).toEqual('first_config');
    expect(results[0].value).toEqual('first_value');
    expect(results[1].key).toEqual('second_config');
    expect(results[1].value).toEqual('second_value');
  });
});
