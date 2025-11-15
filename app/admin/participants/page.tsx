'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Upload, Download, Edit, Trash2 } from 'lucide-react';

interface Participant {
  id: string;
  userId: string;
  teamName: string;
  school: string;
  currentBalance: string;
  startingBalance: string;
  totalInvestments: string;
  days: number;
  brokers: string;
  settings?: {
    notificationsEnabled: boolean;
    riskTolerance: string;
    autoInvest: boolean;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function ParticipantsManagement() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    school: '',
    username: '',
    password: '',
    days: 0,
    brokers: '',
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/admin/participants');
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teamName: '',
      school: '',
      username: '',
      password: '',
      days: 0,
      brokers: '',
    });
    setEditingParticipant(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchParticipants();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Error creating participant:', await response.text());
      }
    } catch (error) {
      console.error('Error creating participant:', error);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/participants', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();
        setImportResults(results);
        await fetchParticipants();
      } else {
        console.error('Error importing participants:', await response.text());
      }
    } catch (error) {
      console.error('Error importing participants:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/participants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchParticipants();
      } else {
        console.error('Error deleting participant:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
    }
  };

  const handleEdit = (participant: Participant) => {
    // TODO: Implement edit functionality
    console.log('Edit participant:', participant);
  };

  const downloadTemplate = () => {
    const template = [
      {
        teamName: 'Example Team',
        school: 'Example School',
        username: 'example_username',
        password: 'password123',
        days: 0,
        brokers: 'Broker Name',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, 'participants_template.xlsx');
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Participants Management</h1>
          <p className="mt-2 text-gray-600">
            Manage participants and import bulk data from CSV/Excel
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Participants</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Upload CSV/Excel File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    disabled={importing}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>File should contain columns:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>teamName</li>
                    <li>school</li>
                    <li>username</li>
                    <li>password</li>
                    <li>days (optional)</li>
                    <li>brokers (optional)</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                {importResults && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Import Results</h4>
                    <p className="text-green-600">
                      ✅ Successfully imported {importResults.imported?.length || 0} participants
                    </p>
                    {importResults.errors?.length > 0 && (
                      <p className="text-red-600">
                        ⚠️ {importResults.errors.length} errors occurred
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Participant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="days">Days</Label>
                    <Input
                      id="days"
                      type="number"
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brokers">Brokers</Label>
                    <Input
                      id="brokers"
                      value={formData.brokers}
                      onChange={(e) => setFormData({ ...formData, brokers: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No participants yet. Add your first participant or import from a file!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Investments</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.teamName}</TableCell>
                    <TableCell>{participant.school}</TableCell>
                    <TableCell>{participant.user.email.split('@')[0]}</TableCell>
                    <TableCell>{formatCurrency(participant.currentBalance)}</TableCell>
                    <TableCell>{formatCurrency(participant.totalInvestments)}</TableCell>
                    <TableCell>{participant.days}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {parseFloat(participant.totalInvestments) > 0 ? 'Active' : 'New'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(participant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}