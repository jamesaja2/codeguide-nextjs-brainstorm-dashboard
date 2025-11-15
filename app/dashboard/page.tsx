'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Building2, Newspaper } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  currentBalance: string;
  totalInvestments: string;
  todayGains: string;
  portfolioValue: string;
}

export default function ParticipantDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    currentBalance: '1000000.00',
    totalInvestments: '0.00',
    todayGains: '+0.00',
    portfolioValue: '1000000.00',
  });

  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch participant data
    const fetchParticipantData = async () => {
      try {
        // This would fetch actual participant data
        // const response = await fetch('/api/dashboard/stats');
        // const data = await response.json();
        // setStats(data);
      } catch (error) {
        console.error('Error fetching participant data:', error);
      }
    };

    // Fetch recent news
    const fetchRecentNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          setRecentNews(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchParticipantData();
    fetchRecentNews();
  }, []);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const isPositive = (value: string) => value.startsWith('+');

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trading Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor your portfolio and make informed trading decisions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">
              Invested in stocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total portfolio worth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Gains</CardTitle>
            {isPositive(stats.todayGains) ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive(stats.todayGains) ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.todayGains)}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/home">
                <Button className="w-full h-16" variant="outline">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                    <div>Stock Market</div>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/transactions">
                <Button className="w-full h-16" variant="outline">
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-1" />
                    <div>Trade</div>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/portfolio">
                <Button className="w-full h-16" variant="outline">
                  <div className="text-center">
                    <Building2 className="h-6 w-6 mx-auto mb-1" />
                    <div>Portfolio</div>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/news">
                <Button className="w-full h-16" variant="outline">
                  <div className="text-center">
                    <Newspaper className="h-6 w-6 mx-auto mb-1" />
                    <div>News</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent News */}
        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNews.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent news
              </div>
            ) : (
              <div className="space-y-3">
                {recentNews.map((news) => (
                  <div key={news.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {news.title}
                      </h4>
                      <Badge variant={news.type === 'paid' ? 'default' : 'secondary'} className="ml-2">
                        {news.type === 'paid' ? 'Premium' : 'Free'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {news.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(news.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {recentNews.length > 0 && (
                  <Link href="/dashboard/news">
                    <Button variant="link" className="w-full mt-2">
                      View all news →
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}