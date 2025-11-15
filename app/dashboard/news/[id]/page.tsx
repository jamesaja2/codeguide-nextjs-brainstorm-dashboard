'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Lock } from 'lucide-react';

interface News {
  id: string;
  title: string;
  content: string;
  type: 'free' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else if (response.status === 404) {
        setError('Article not found');
      } else if (response.status === 403) {
        setError('This is premium content. Please upgrade to access.');
      } else {
        setError('Failed to load article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Article not found'}
            </h2>
            <Button onClick={() => router.back()} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge variant={article.type === 'paid' ? 'default' : 'secondary'}>
                {article.type === 'paid' ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Premium
                  </>
                ) : (
                  'Free'
                )}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(article.createdAt)}
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {article.content}
            </div>
          </div>

          {article.type === 'paid' && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="font-semibold text-blue-900">Premium Content</h4>
                  <p className="text-sm text-blue-700">
                    This is premium news content available only to paid subscribers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
              {article.type === 'free' && (
                <Button variant="outline">
                  Share Article
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}