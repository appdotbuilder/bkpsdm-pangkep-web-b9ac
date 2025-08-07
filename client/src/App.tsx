
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileDown, Users, Building2, Eye, Clock, MapPin, User } from 'lucide-react';
import type { News, Announcement, Event, Download, StaticContent, NewsCategory, DownloadCategory } from '../../server/src/schema';

function App() {
  // State for all data
  const [popularNews, setPopularNews] = useState<News[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [visiMisi, setVisiMisi] = useState<StaticContent | null>(null);
  const [strukturOrganisasi, setStrukturOrganisasi] = useState<StaticContent | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('beranda');
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedDownloadCategory, setSelectedDownloadCategory] = useState<DownloadCategory | 'all'>('all');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Load homepage data
  const loadHomeData = useCallback(async () => {
    try {
      const [popularResult, latestResult, eventsResult] = await Promise.all([
        trpc.getPopularNews.query(5),
        trpc.getLatestNews.query(5),
        trpc.getUpcomingEvents.query(5)
      ]);
      
      setPopularNews(popularResult);
      setLatestNews(latestResult);
      setUpcomingEvents(eventsResult);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, []);

  // Load all news with category filter
  const loadNews = useCallback(async () => {
    try {
      const filter = selectedNewsCategory === 'all' ? undefined : { category: selectedNewsCategory };
      const result = await trpc.getNews.query(filter);
      setAllNews(result);
    } catch (error) {
      console.error('Failed to load news:', error);
    }
  }, [selectedNewsCategory]);

  // Load announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      const result = await trpc.getAnnouncements.query();
      setAnnouncements(result);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  }, []);

  // Load downloads with category filter
  const loadDownloads = useCallback(async () => {
    try {
      const filter = selectedDownloadCategory === 'all' ? undefined : { category: selectedDownloadCategory };
      const result = await trpc.getDownloads.query(filter);
      setDownloads(result);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    }
  }, [selectedDownloadCategory]);

  // Load static content
  const loadStaticContent = useCallback(async () => {
    try {
      const [visiMisiResult, strukturResult] = await Promise.all([
        trpc.getStaticContentByKey.query('visi_misi'),
        trpc.getStaticContentByKey.query('struktur_organisasi')
      ]);
      
      setVisiMisi(visiMisiResult);
      setStrukturOrganisasi(strukturResult);
    } catch (error) {
      console.error('Failed to load static content:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([loadHomeData(), loadStaticContent()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, [loadHomeData, loadStaticContent]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'berita' && allNews.length === 0) {
      loadNews();
    } else if (activeTab === 'pengumuman' && announcements.length === 0) {
      loadAnnouncements();
    } else if (activeTab === 'pusat-unduhan' && downloads.length === 0) {
      loadDownloads();
    }
  }, [activeTab, allNews.length, announcements.length, downloads.length, loadNews, loadAnnouncements, loadDownloads]);

  // Reload news when category changes
  useEffect(() => {
    if (activeTab === 'berita') {
      loadNews();
    }
  }, [selectedNewsCategory, activeTab, loadNews]);

  // Reload downloads when category changes
  useEffect(() => {
    if (activeTab === 'pusat-unduhan') {
      loadDownloads();
    }
  }, [selectedDownloadCategory, activeTab, loadDownloads]);

  const categoryLabels: Record<NewsCategory, string> = {
    umum: 'Umum',
    kepegawaian: 'Kepegawaian',
    pengembangan: 'Pengembangan',
    pengumuman: 'Pengumuman',
    kegiatan: 'Kegiatan'
  };

  const downloadCategoryLabels: Record<DownloadCategory, string> = {
    peraturan: 'Peraturan',
    formulir: 'Formulir',
    panduan: 'Panduan',
    laporan: 'Laporan',
    lainnya: 'Lainnya'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Building2 className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold">BKPSDM</h1>
              <p className="text-blue-200">Badan Kepegawaian dan Pengembangan SDM</p>
              <p className="text-blue-200 text-sm">Kabupaten Pangkajene dan Kepulauan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-800 shadow">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-0 h-auto p-0">
              <TabsTrigger 
                value="beranda" 
                className="px-6 py-3 text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-none border-0"
              >
                🏠 Beranda
              </TabsTrigger>
              <TabsTrigger 
                value="profil" 
                className="px-6 py-3 text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-none border-0"
              >
                👥 Profil
              </TabsTrigger>
              <TabsTrigger 
                value="berita" 
                className="px-6 py-3 text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-none border-0"
              >
                📰 Berita
              </TabsTrigger>
              <TabsTrigger 
                value="pengumuman" 
                className="px-6 py-3 text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-none border-0"
              >
                📢 Pengumuman
              </TabsTrigger>
              <TabsTrigger 
                value="pusat-unduhan" 
                className="px-6 py-3 text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-none border-0"
              >
                📁 Pusat Unduhan
              </TabsTrigger>
            </TabsList>

            <div className="container mx-auto px-4 py-8">
              {/* Beranda Tab */}
              <TabsContent value="beranda" className="mt-0 space-y-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    🏛️ Selamat Datang di BKPSDM Pangkep
                  </h2>
                  <p className="text-xl text-blue-100">
                    Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Pangkajene dan Kepulauan
                  </p>
                </div>

                {/* News Categories */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">📂 Kategori Berita</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab('berita');
                        setSelectedNewsCategory('all');
                      }}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      Semua Kategori
                    </Button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab('berita');
                          setSelectedNewsCategory(key as NewsCategory);
                        }}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Popular News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      🔥 Berita Populer
                    </h3>
                    {popularNews.length === 0 ? (
                      <p className="text-gray-500 italic">Belum ada berita populer</p>
                    ) : (
                      <div className="space-y-4">
                        {popularNews.map((news: News) => (
                          <Card key={news.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2 line-clamp-2">{news.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {news.view_count} tayangan
                                </span>
                                <Badge variant="secondary">{categoryLabels[news.category]}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {news.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Latest News */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      📅 Berita Terbaru
                    </h3>
                    {latestNews.length === 0 ? (
                      <p className="text-gray-500 italic">Belum ada berita terbaru</p>
                    ) : (
                      <div className="space-y-4">
                        {latestNews.map((news: News) => (
                          <Card key={news.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2 line-clamp-2">{news.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {news.publish_date.toLocaleDateString('id-ID')}
                                </span>
                                <Badge variant="secondary">{categoryLabels[news.category]}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {news.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🗓️ Agenda Kegiatan
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-gray-500 italic">Tidak ada agenda kegiatan mendatang</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingEvents.map((event: Event) => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg line-clamp-2">{event.event_name}</CardTitle>
                            <CardDescription className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">
                                  {event.start_date.toLocaleDateString('id-ID')}
                                  {event.start_date.getTime() !== event.end_date.getTime() && 
                                    ` - ${event.end_date.toLocaleDateString('id-ID')}`
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">{event.organizer}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Profil Tab */}
              <TabsContent value="profil" className="mt-0">
                <Tabs defaultValue="visi-misi">
                  <TabsList className="mb-6">
                    <TabsTrigger value="visi-misi">🎯 Visi Misi</TabsTrigger>
                    <TabsTrigger value="struktur">🏢 Struktur Organisasi</TabsTrigger>
                  </TabsList>

                  <TabsContent value="visi-misi">
                    <Card>
                      <CardHeader>
                        <CardTitle>🎯 Visi Misi BKPSDM Pangkep</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {visiMisi ? (
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: visiMisi.content }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">Konten visi misi belum tersedia</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="struktur">
                    <Card>
                      <CardHeader>
                        <CardTitle>🏢 Struktur Organisasi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {strukturOrganisasi ? (
                          <div>
                            {strukturOrganisasi.image_path && (
                              <div className="mb-6 text-center">
                                <img 
                                  src={strukturOrganisasi.image_path} 
                                  alt="Struktur Organisasi"
                                  className="max-w-full h-auto rounded-lg shadow-md"
                                />
                              </div>
                            )}
                            <div 
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: strukturOrganisasi.content }}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Struktur organisasi belum tersedia</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Berita Tab */}
              <TabsContent value="berita" className="mt-0">
                {!selectedNews ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">📰 Berita</h2>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedNewsCategory === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedNewsCategory('all')}
                        >
                          Semua
                        </Button>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            variant={selectedNewsCategory === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedNewsCategory(key as NewsCategory)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {allNews.length === 0 ? (
                      <p className="text-gray-500 italic text-center py-8">Belum ada berita yang tersedia</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allNews.map((news: News) => (
                          <Card key={news.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-0">
                              {news.featured_image && (
                                <img 
                                  src={news.featured_image}
                                  alt={news.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                              )}
                              <div className="p-4">
                                <h3 className="font-bold mb-2 line-clamp-2">{news.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {news.publish_date.toLocaleDateString('id-ID')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {news.view_count}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                  {news.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                </p>
                                <div className="flex justify-between items-center">
                                  <Badge variant="secondary">{categoryLabels[news.category]}</Badge>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedNews(news)}
                                  >
                                    Baca Selengkapnya
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedNews(null)}
                      className="mb-6"
                    >
                      ← Kembali ke Daftar Berita
                    </Button>
                    <Card>
                      <CardContent className="p-0">
                        {selectedNews.featured_image && (
                          <img 
                            src={selectedNews.featured_image}
                            alt={selectedNews.title}
                            className="w-full h-64 object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-6">
                          <h1 className="text-3xl font-bold mb-4">{selectedNews.title}</h1>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {selectedNews.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {selectedNews.publish_date.toLocaleDateString('id-ID')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {selectedNews.view_count} tayangan
                            </span>
                            <Badge variant="secondary">{categoryLabels[selectedNews.category]}</Badge>
                          </div>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Pengumuman Tab */}
              <TabsContent value="pengumuman" className="mt-0">
                {!selectedAnnouncement ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">📢 Pengumuman</h2>
                    {announcements.length === 0 ? (
                      <p className="text-gray-500 italic text-center py-8">Belum ada pengumuman yang tersedia</p>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map((announcement: Announcement) => (
                          <Card key={announcement.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                                <Badge variant={announcement.status ? 'default' : 'secondary'}>
                                  {announcement.status ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {announcement.publish_date.toLocaleDateString('id-ID')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 line-clamp-3 mb-4">{announcement.description}</p>
                              <div className="flex justify-between items-center">
                                {announcement.attachment_file && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <FileDown className="h-4 w-4" />
                                    File terlampir
                                  </div>
                                )}
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedAnnouncement(announcement)}
                                >
                                  Lihat Detail
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedAnnouncement(null)}
                      className="mb-6"
                    >
                      ← Kembali ke Daftar Pengumuman
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedAnnouncement.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedAnnouncement.publish_date.toLocaleDateString('id-ID')}
                          </span>
                          <Badge variant={selectedAnnouncement.status ? 'default' : 'secondary'}>
                            {selectedAnnouncement.status ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none mb-6">
                          {selectedAnnouncement.description.split('\n').map((paragraph: string, index: number) => (
                            <p key={index} className="mb-3">{paragraph}</p>
                          ))}
                        </div>
                        {selectedAnnouncement.attachment_file && (
                          <div className="border-t pt-6">
                            <h4 className="font-semibold mb-3">File Lampiran:</h4>
                            <Button variant="outline" size="sm">
                              <FileDown className="h-4 w-4 mr-2" />
                              Unduh Lampiran
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Pusat Unduhan Tab */}
              <TabsContent value="pusat-unduhan" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📁 Pusat Unduhan</h2>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedDownloadCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDownloadCategory('all')}
                    >
                      Semua
                    </Button>
                    {Object.entries(downloadCategoryLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedDownloadCategory === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDownloadCategory(key as DownloadCategory)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {downloads.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">Belum ada file untuk diunduh</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {downloads.map((download: Download) => (
                      <Card key={download.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-blue-600" />
                            {download.document_name}
                          </CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">{download.publisher}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">{download.upload_date.toLocaleDateString('id-ID')}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{download.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">{downloadCategoryLabels[download.category]}</Badge>
                              <span className="text-sm text-gray-500">{download.hits} unduhan</span>
                            </div>
                            <Button size="sm">
                              <FileDown className="h-4 w-4 mr-1" />
                              Unduh
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Building2 className="h-10 w-10" />
                <div>
                  <h3 className="text-lg font-bold">BKPSDM Pangkep</h3>
                  <p className="text-blue-200 text-sm">Kabupaten Pangkajene dan Kepulauan</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm">
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia yang berkomitmen untuk meningkatkan kualitas pelayanan publik.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">📍 Informasi Kontak</h4>
              <div className="text-blue-200 text-sm space-y-2">
                <p>📧 Email: bkpsdm@pangkepkab.go.id</p>
                <p>📞 Telepon: (0410) 21XXX</p>
                <p>🏢 Alamat: Jl. A. Mappanyuki, Pangkajene, Sulawesi Selatan</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">🔗 Tautan</h4>
              <div className="text-blue-200 text-sm space-y-2">
                <p>🌐 Website Pemkab Pangkep</p>
                <p>📊 Sistem Informasi Kepegawaian</p>
                <p>📚 E-Learning SDM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center">
            <p className="text-blue-200 text-sm">
              © 2024 BKPSDM Kabupaten Pangkajene dan Kepulauan. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
