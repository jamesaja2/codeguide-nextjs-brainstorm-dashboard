'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalCompanies: 0,
    totalParticipants: 0,
    totalTransactions: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const [newsRes, companiesRes, participantsRes] = await Promise.all([
          fetch('/api/admin/news'),
          fetch('/api/admin/companies'),
          fetch('/api/admin/participants'),
        ]);

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setStats(prev => ({ ...prev, totalNews: newsData.length }));
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setStats(prev => ({ ...prev, totalCompanies: companiesData.length }));
        }

        if (participantsRes.ok) {
          const participantsData = await participantsRes.json();
          setStats(prev => ({ ...prev, totalParticipants: participantsData.length }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'News', value: stats.totalNews },
    { name: 'Companies', value: stats.totalCompanies },
    { name: 'Participants', value: stats.totalParticipants },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage news, companies, participants, and monitor trading activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News</CardTitle>
            <Badge variant="secondary">{stats.totalNews}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNews}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Badge variant="secondary">{stats.totalCompanies}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Badge variant="secondary">{stats.totalParticipants}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Badge variant="secondary">{stats.totalTransactions}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => window.location.href = '/admin/news'}
                className="w-full"
                variant="outline"
              >
                Manage News
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/companies'}
                className="w-full"
                variant="outline"
              >
                Manage Companies
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/participants'}
                className="w-full"
                variant="outline"
              >
                Manage Participants
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/transactions'}
                className="w-full"
                variant="outline"
              >
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            No recent activity to display. Activity will appear here as users interact with the platform.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}