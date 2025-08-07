
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { staticContentTable } from '../db/schema';
import { getStaticContentByKey, getAllStaticContent } from '../handlers/get_static_content';

const testStaticContent1 = {
  key: 'visi_misi',
  title: 'Visi dan Misi',
  content: 'Visi: Menjadi institusi terdepan. Misi: Memberikan pelayanan terbaik.',
  image_path: '/images/visi-misi.jpg'
};

const testStaticContent2 = {
  key: 'struktur_organisasi',
  title: 'Struktur Organisasi',
  content: 'Struktur organisasi lengkap dengan bagan.',
  image_path: null
};

describe('getStaticContentByKey', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return static content by key', async () => {
    // Create test data
    await db.insert(staticContentTable)
      .values(testStaticContent1)
      .execute();

    const result = await getStaticContentByKey('visi_misi');

    expect(result).not.toBeNull();
    expect(result?.key).toEqual('visi_misi');
    expect(result?.title).toEqual('Visi dan Misi');
    expect(result?.content).toEqual('Visi: Menjadi institusi terdepan. Misi: Memberikan pelayanan terbaik.');
    expect(result?.image_path).toEqual('/images/visi-misi.jpg');
    expect(result?.id).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent key', async () => {
    const result = await getStaticContentByKey('non_existent_key');

    expect(result).toBeNull();
  });

  it('should return content with null image_path', async () => {
    // Create test data without image
    await db.insert(staticContentTable)
      .values(testStaticContent2)
      .execute();

    const result = await getStaticContentByKey('struktur_organisasi');

    expect(result).not.toBeNull();
    expect(result?.key).toEqual('struktur_organisasi');
    expect(result?.image_path).toBeNull();
  });
});

describe('getAllStaticContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no content exists', async () => {
    const results = await getAllStaticContent();

    expect(results).toEqual([]);
  });

  it('should return all static content', async () => {
    // Create multiple test records
    await db.insert(staticContentTable)
      .values([testStaticContent1, testStaticContent2])
      .execute();

    const results = await getAllStaticContent();

    expect(results).toHaveLength(2);
    
    const visiMisi = results.find(item => item.key === 'visi_misi');
    const strukturOrg = results.find(item => item.key === 'struktur_organisasi');

    expect(visiMisi).toBeDefined();
    expect(visiMisi?.title).toEqual('Visi dan Misi');
    expect(visiMisi?.image_path).toEqual('/images/visi-misi.jpg');

    expect(strukturOrg).toBeDefined();
    expect(strukturOrg?.title).toEqual('Struktur Organisasi');
    expect(strukturOrg?.image_path).toBeNull();

    // Verify all results have required fields
    results.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.key).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.content).toBeDefined();
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.updated_at).toBeInstanceOf(Date);
    });
  });
});
