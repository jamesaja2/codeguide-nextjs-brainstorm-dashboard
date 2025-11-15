'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, TrendingDown, Eye, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  currentPrice: string;
  previousPrice: string;
  marketCap: string;
  financials?: {
    revenue: string;
    profit: string;
    growth: string;
    marketShare: string;
  };
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('0');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.slice(0, 5)); // Show first 5 companies
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getPriceChange = (current: string, previous: string) => {
    const curr = parseFloat(current);
    const prev = parseFloat(previous);
    const change = ((curr - prev) / prev * 100).toFixed(2);
    const isPositive = curr >= prev;

    return {
      value: `${isPositive ? '+' : ''}${change}%`,
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  const generateChartData = (company: Company) => {
    // Generate sample historical data
    const currentPrice = parseFloat(company.currentPrice);
    const volatility = 0.05; // 5% volatility
    const data = [];

    for (let i = 30; i >= 0; i--) {
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = currentPrice * (1 + randomChange * (i / 30));
      data.push(price);
    }

    return {
      labels: Array.from({ length: 31 }, (_, i) => `Day ${30 - i}`),
      datasets: [
        {
          label: `${company.name} Stock Price`,
          data: data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const stockSummary = {
    totalStocks: companies.length,
    gainers: companies.filter(c => parseFloat(c.currentPrice) > parseFloat(c.previousPrice)).length,
    losers: companies.filter(c => parseFloat(c.currentPrice) < parseFloat(c.previousPrice)).length,
    totalMarketCap: companies.reduce((sum, c) => sum + parseFloat(c.marketCap), 0),
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stock Market</h1>
        <p className="mt-2 text-gray-600">
          Monitor stock prices and track market performance
        </p>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.totalStocks}</div>
            <p className="text-xs text-muted-foreground">
              Available for trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockSummary.gainers}</div>
            <p className="text-xs text-muted-foreground">
              Stocks up today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockSummary.losers}</div>
            <p className="text-xs text-muted-foreground">
              Stocks down today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stockSummary.totalMarketCap.toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              Total market value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Tabs with Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {companies.map((company, index) => (
                <TabsTrigger key={company.id} value={index.toString()}>
                  {company.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {companies.map((company, index) => {
              const priceChange = getPriceChange(company.currentPrice, company.previousPrice);
              const chartData = generateChartData(company);

              return (
                <TabsContent key={company.id} value={index.toString()} className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Info & Chart */}
                    <div>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                        <p className="text-gray-600 mb-4">{company.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Current Price</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(company.currentPrice)}
                            </p>
                            <p className={`text-sm font-medium ${priceChange.color}`}>
                              {priceChange.isPositive ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                              {priceChange.value}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Market Cap</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(company.marketCap)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stock Chart */}
                      <div className="h-64">
                        <Line
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top' as const,
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: false,
                                ticks: {
                                  callback: function(value) {
                                    return '$' + Number(value).toFixed(2);
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-4">
                      {company.financials && (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Financials</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Revenue</span>
                                  <span className="font-medium">{company.financials.revenue}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Profit</span>
                                  <span className="font-medium">{company.financials.profit}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Growth</span>
                                  <span className="font-medium">{company.financials.growth}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Market Share</span>
                                  <span className="font-medium">{company.financials.marketShare}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Company Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location</span>
                              <span className="font-medium">{company.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Previous Price</span>
                              <span className="font-medium">{formatCurrency(company.previousPrice)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{company.name} - Full Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-gray-600">{company.description}</p>
                              </div>

                              {company.financials && (
                                <div>
                                  <h4 className="font-medium mb-2">Complete Financial Data</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Revenue</p>
                                      <p className="font-medium">{company.financials.revenue}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Profit</p>
                                      <p className="font-medium">{company.financials.profit}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Growth Rate</p>
                                      <p className="font-medium">{company.financials.growth}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Market Share</p>
                                      <p className="font-medium">{company.financials.marketShare}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}