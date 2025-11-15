'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';

interface News {
  id: string;
  title: string;
  content: string;
  type: 'free' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  }, [news, searchTerm, filterType]);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewArticle = (articleId: string) => {
    // Navigate to the article page
    window.location.href = `/dashboard/news/${articleId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">News Feed</h1>
        <p className="mt-2 text-gray-600">
          Stay updated with the latest market news and analysis
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterType} onValueChange={(value: 'all' | 'free' | 'paid') => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All News</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Articles */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading news...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              {news.length === 0 ? 'No news articles available.' : 'No news articles match your filters.'}
            </div>
            {news.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <Badge variant={article.type === 'paid' ? 'default' : 'secondary'}>
                        {article.type === 'paid' ? 'Premium' : 'Free'}
                      </Badge>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-3">
                      {article.content}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Click to read full article
                  </div>
                  <Button
                    onClick={() => handleViewArticle(article.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}