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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Contact Submissions</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Manage user inquiries and messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-red-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
                  {unreadCount} Unread
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={fetchContacts} className="gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {error ? (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-6 sm:py-8">
              <div className="text-center">
                <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
                <Button onClick={fetchContacts} variant="outline" className="text-sm">Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="py-12 sm:py-16">
              <div className="text-center">
                <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Contact Submissions</h3>
                <p className="text-gray-400 text-sm sm:text-base px-4">When users submit the contact form, their messages will appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800/80 border-gray-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <span className="text-lg sm:text-xl">All Contacts ({contacts.length})</span>
                {unreadCount > 0 && (
                  <span className="text-sm sm:text-base text-red-400">{unreadCount} unread</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3 sm:space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {contact.is_read ? (
                            <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-500 text-white text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                          <span className="font-medium text-white text-sm sm:text-base truncate">{contact.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDate(contact.created_at)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="break-all text-xs sm:text-sm">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{contact.phone}</span>
                        </div>
                        {(contact.city || contact.state) && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {contact.city && contact.state 
                                ? `${contact.city}, ${contact.state}`
                                : contact.city || contact.state
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                            {contact.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {contact.is_read ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsUnread(contact.id)}
                            className="text-xs px-2 py-1.5 h-8"
                          >
                            Mark Unread
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(contact.id)}
                            className="text-xs px-2 py-1.5 h-8"
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2 py-1.5 h-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300 text-sm">Status</TableHead>
                      <TableHead className="text-gray-300 text-sm">Name</TableHead>
                      <TableHead className="text-gray-300 text-sm">Contact Info</TableHead>
                      <TableHead className="text-gray-300 text-sm">Location</TableHead>
                      <TableHead className="text-gray-300 text-sm">Message</TableHead>
                      <TableHead className="text-gray-300 text-sm">Date</TableHead>
                      <TableHead className="text-gray-300 text-sm">Actions</TableHead>
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
                          <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                            <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                              <p className="text-sm text-gray-300 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                                {contact.message}
                              </p>
                            </div>
                            {contact.message.length > 150 && (
                              <button
                                onClick={() => {
                                  // Create a modal-like experience
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
                                  modal.innerHTML = `
                                    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                      <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-lg font-semibold text-white">Message from ${contact.name}</h3>
                                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                          </svg>
                                        </button>
                                      </div>
                                      <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                                        <p class="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">${contact.message.replace(/\n/g, '<br>')}</p>
                                      </div>
                                      <div class="mt-4 flex justify-end">
                                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm">
                                          Close
                                        </button>
                                      </div>
                                    </div>
                                  `;
                                  document.body.appendChild(modal);
                                }}
                                className="text-xs text-violet-400 hover:text-violet-300 mt-2 underline"
                              >
                                Read full message
                              </button>
                            )}
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
