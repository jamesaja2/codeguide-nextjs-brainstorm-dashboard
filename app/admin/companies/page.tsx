'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
}

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    currentPrice: '',
    marketCap: '',
    financials: {
      revenue: '',
      profit: '',
      growth: '',
      marketShare: '',
    },
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      currentPrice: '',
      marketCap: '',
      financials: {
        revenue: '',
        profit: '',
        growth: '',
        marketShare: '',
      },
    });
    setEditingCompany(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCompany
        ? `/api/admin/companies/${editingCompany.id}`
        : '/api/admin/companies';
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCompanies();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Error saving company:', await response.text());
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      location: company.location,
      currentPrice: company.currentPrice,
      marketCap: company.marketCap,
      financials: company.financials || {
        revenue: '',
        profit: '',
        growth: '',
        marketShare: '',
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCompanies();
      } else {
        console.error('Error deleting company:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting company:', error);
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
    if (curr > prev) return { text: '+', color: 'text-green-600' };
    if (curr < prev) return { text: '-', color: 'text-red-600' };
    return { text: '=', color: 'text-gray-600' };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies Management</h1>
          <p className="mt-2 text-gray-600">
            Manage company information and stock data
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'Edit Company' : 'Create Company'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentPrice">Current Price</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="marketCap">Market Cap</Label>
                  <Input
                    id="marketCap"
                    type="number"
                    step="0.01"
                    value={formData.marketCap}
                    onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Financials (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue">Revenue</Label>
                    <Input
                      id="revenue"
                      value={formData.financials.revenue}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, revenue: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profit">Profit</Label>
                    <Input
                      id="profit"
                      value={formData.financials.profit}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, profit: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="growth">Growth</Label>
                    <Input
                      id="growth"
                      value={formData.financials.growth}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, growth: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketShare">Market Share</Label>
                    <Input
                      id="marketShare"
                      value={formData.financials.marketShare}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, marketShare: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No companies yet. Add your first company!
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => {
                const priceChange = getPriceChange(company.currentPrice, company.previousPrice);
                return (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-lg">{company.name}</h3>
                        <span className={`font-medium ${priceChange.color}`}>
                          {priceChange.text} {formatCurrency(company.currentPrice)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{company.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📍 {company.location}</span>
                        <span>💰 Market Cap: {formatCurrency(company.marketCap)}</span>
                        <span>📅 Added: {new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}