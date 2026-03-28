'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Calendar, CheckCircle, Eye, Trash2, RefreshCw } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchContacts = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contacts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contacts/unread/count`);
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const markAsRead = async (contactId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setContacts(contacts.map(c => 
          c.id === contactId ? { ...c, is_read: true } : c
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAsUnread = async (contactId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: false }),
      });

      if (response.ok) {
        setContacts(contacts.map(c => 
          c.id === contactId ? { ...c, is_read: false } : c
        ));
        setUnreadCount(unreadCount + 1);
      }
    } catch (err) {
      console.error('Failed to mark as unread:', err);
    }
  };

  const deleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const contact = contacts.find(c => c.id === contactId);
        setContacts(contacts.filter(c => c.id !== contactId));
        if (contact && !contact.is_read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchUnreadCount();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
                <p className="text-gray-400">Manage user inquiries and messages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-red-500 text-white">
                  {unreadCount} Unread
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={fetchContacts} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchContacts} variant="outline">Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="py-16">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Contact Submissions</h3>
                <p className="text-gray-400">When users submit the contact form, their messages will appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>All Contacts ({contacts.length})</span>
                {unreadCount > 0 && (
                  <span className="text-sm text-red-400">{unreadCount} unread</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Contact Info</TableHead>
                      <TableHead className="text-gray-300">Location</TableHead>
                      <TableHead className="text-gray-300">Message</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell>
                          {contact.is_read ? (
                            <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-500 text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white">{contact.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(contact.city || contact.state) ? (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <MapPin className="w-3 h-3" />
                              {contact.city && contact.state 
                                ? `${contact.city}, ${contact.state}`
                                : contact.city || contact.state
                              }
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {contact.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="w-3 h-3" />
                            {formatDate(contact.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {contact.is_read ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsUnread(contact.id)}
                                className="text-xs"
                              >
                                Mark Unread
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(contact.id)}
                                className="text-xs"
                              >
                                Mark Read
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteContact(contact.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
