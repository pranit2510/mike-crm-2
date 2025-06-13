'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  FileText as FileTextIcon,
  Eye,
  Edit3,
  Trash2,
  Send
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import FlowActions from '@/components/ui/FlowActions';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { quoteStages, type QuoteStatus } from '@/lib/flowStates';
import { quoteOperations, clientOperations, technicianOperations, invoiceOperations } from '@/lib/supabase-client';
import { quoteConversionOperations } from '@/lib/quote-conversion';

// Enhanced quote type with flow status
interface EnhancedQuote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  expiryDate: string;
  totalAmount: number;
  status: QuoteStatus;
  description: string;
  lineItems?: number;
  followUpDate?: string;
  approvedDate?: string;
  sentDate?: string;
  viewedDate?: string;
}

// Mock enhanced data with proper flow statuses
const mockEnhancedQuotes: EnhancedQuote[] = [
  {
    id: 'Q001',
    clientId: '1',
    clientName: 'Sarah Connor',
    date: '2024-05-01',
    expiryDate: '2024-05-31',
    totalAmount: 1250.75,
    status: 'Approved' as QuoteStatus,
    description: 'Kitchen lighting fixture installation',
    lineItems: 4,
    sentDate: '2024-05-01',
    viewedDate: '2024-05-02',
    approvedDate: '2024-05-03'
  },
  {
    id: 'Q002',
    clientId: '2',
    clientName: 'Kyle Reese',
    date: '2024-05-05',
    expiryDate: '2024-06-05',
    totalAmount: 850.00,
    status: 'Sent' as QuoteStatus,
    description: 'Electrical panel upgrade',
    lineItems: 3,
    sentDate: '2024-05-05',
    followUpDate: '2024-05-25'
  },
  {
    id: 'Q003',
    clientId: '3',
    clientName: 'John Matrix',
    date: '2024-04-20',
    expiryDate: '2024-05-20',
    totalAmount: 2400.50,
    status: 'Reviewed' as QuoteStatus,
    description: 'Complete home rewiring project',
    lineItems: 8,
    sentDate: '2024-04-20',
    viewedDate: '2024-04-22'
  },
  {
    id: 'Q004',
    clientId: '4',
    clientName: 'Dutch Schaefer',
    date: '2024-05-10',
    expiryDate: '2024-06-10',
    totalAmount: 550.20,
    status: 'Draft' as QuoteStatus,
    description: 'Garage outlet installation',
    lineItems: 2
  },
  {
    id: 'Q005',
    clientId: '1',
    clientName: 'Sarah Connor',
    date: '2024-04-01',
    expiryDate: '2024-04-30',
    totalAmount: 320.00,
    status: 'Expired' as QuoteStatus,
    description: 'Bathroom fan installation',
    lineItems: 1,
    sentDate: '2024-04-01'
  }
];

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [emailMessage, setEmailMessage] = useState<{ [key: string]: string }>({});

  const statusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [quotesData, clientsData, invoicesData] = await Promise.all([
          quoteOperations.getAll(),
          clientOperations.getAll(),
          invoiceOperations.getAll()
        ]);
        setQuotes(quotesData);
        setClients(clientsData);
        setInvoices(invoicesData);
      } catch (err) {
        setError('Failed to load quotes');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : 'Unknown';
  };

  const handleFlowAction = async (action: string, quoteId: string) => {
    setActionLoading(`${action}-${quoteId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setActionLoading(null);
    
    switch (action) {
      case 'createJob':
        console.log(`Creating job from quote ${quoteId}`);
        break;
      default:
        console.log(`${action} for quote ${quoteId}`);
    }
  };

  const handleSendQuote = (quoteId: string) => {
    alert(`Sending quote ${quoteId} (mock)...`);
  };

  const handleDeleteQuote = async (quoteId: number) => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;
    try {
      await quoteOperations.delete(quoteId);
      setQuotes(prev => prev.filter(q => q.id !== quoteId));
    } catch (err) {
      alert('Failed to delete quote');
    }
  };

  const handleSendEmail = async (quote: any) => {
    // Find the client for this quote
    const client = clients.find((c: any) => c.id === quote.client_id);
    const client_email = client?.email;
    const client_name = client?.name;
    setEmailStatus(prev => ({ ...prev, [quote.id]: 'loading' }));
    setEmailMessage(prev => ({ ...prev, [quote.id]: '' }));
    try {
      await fetch('/api/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: { ...quote, client_email, client_name } })
      });
      setEmailStatus(prev => ({ ...prev, [quote.id]: 'success' }));
      setEmailMessage(prev => ({ ...prev, [quote.id]: 'Email sent!' }));
      setTimeout(() => {
        setEmailStatus(prev => ({ ...prev, [quote.id]: 'idle' }));
        setEmailMessage(prev => ({ ...prev, [quote.id]: '' }));
      }, 2000);
    } catch (err) {
      setEmailStatus(prev => ({ ...prev, [quote.id]: 'error' }));
      setEmailMessage(prev => ({ ...prev, [quote.id]: 'Failed to send email' }));
      setTimeout(() => {
        setEmailStatus(prev => ({ ...prev, [quote.id]: 'idle' }));
        setEmailMessage(prev => ({ ...prev, [quote.id]: '' }));
      }, 2000);
    }
  };

  // Add this function to update quote status inline
  const handleStatusChange = async (quoteId: number, newStatus: "draft" | "sent" | "accepted" | "rejected") => {
    try {
      await quoteOperations.update(quoteId, { status: newStatus });
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const hasInvoice = (quoteId: number) => invoices.some(inv => inv.quote_id === quoteId);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.id.toString().includes(searchTerm.toLowerCase()) ||
      getClientName(quote.client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className='p-8 text-center'>Loading quotes...</div>;
  }
  if (error) {
    return <div className='p-8 text-center text-red-600'>{error}</div>;
  }

  return (
    <div className="fade-in">
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <FileTextIcon className='mr-3 h-8 w-8 text-primary' /> Quotes / Estimates
        </h1>
        <Link href='/quotes/new' className='btn-primary group inline-flex items-center'>
          <PlusCircle size={20} className='mr-2 group-hover:rotate-90 transition-transform duration-300' />
          <span>Create New Quote</span>
        </Link>
      </div>

      {/* Enhanced Status Sorting Bar */}
      <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 fade-in' style={{ animationDelay: '0.05s' }}>
        <div className='flex flex-wrap gap-2'>
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === option.value ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className='mb-6 relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
        <input
          type='text'
          placeholder='Search quotes by id, client, or notes...'
          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Enhanced Quotes Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden fade-in' style={{ animationDelay: '0.2s' }}>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Quote ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Client</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Valid Until</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Notes</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-6 py-12 text-center text-sm text-gray-500'>
                    {searchTerm ? 'No quotes found matching your criteria.' : 'No quotes found. Start by creating a new quote.'}
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className='table-row-hover group'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Link 
                        href={`/quotes/${quote.id}`}
                        className='text-sm font-medium text-primary hover:text-primary-dark group-hover:underline transition-all duration-200'
                      >
                        {quote.id}
                      </Link>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Link 
                        href={`/clients/${quote.client_id}`} 
                        className='text-sm text-gray-900 hover:text-primary transition-colors duration-200'
                      >
                        {getClientName(quote.client_id)}
                      </Link>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-semibold text-gray-900'>
                        ${quote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap capitalize'>
                      <select
                        value={quote.status}
                        onChange={e => handleStatusChange(quote.id, e.target.value as "draft" | "sent" | "accepted" | "rejected")}
                        className='default-input text-sm px-2 py-1 rounded'
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {quote.notes || '-'}
                    </td>
                    
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1 flex items-center'>
                      <Link 
                        href={`/quotes/${quote.id}/edit`} 
                        className='text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-100/50 transition-all duration-200' 
                        title='Edit Quote'
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleSendEmail(quote)}
                        className={`text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100/50 transition-all duration-200 flex items-center ${emailStatus[quote.id] === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title='Send Email'
                        disabled={emailStatus[quote.id] === 'loading'}
                      >
                        {emailStatus[quote.id] === 'loading' ? (
                          <span className="animate-spin mr-1 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
                        ) : (
                          <Send size={18} />
                        )}
                        <span className="sr-only">Send Email</span>
                      </button>
                      {emailMessage[quote.id] && (
                        <span className={`ml-2 text-xs ${emailStatus[quote.id] === 'success' ? 'text-green-600' : 'text-red-600'}`}>{emailMessage[quote.id]}</span>
                      )}
                      <button 
                        onClick={() => handleDeleteQuote(quote.id)}
                        className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100/50 transition-all duration-200'
                        title='Delete Quote'
                      >
                        <Trash2 size={18} />
                      </button>
                      {quote.status === 'accepted' && !hasInvoice(quote.id) && (
                        <button
                          className='btn-primary btn-sm mt-2'
                          onClick={async () => {
                            await quoteConversionOperations.convertQuoteToInvoice(quote.id);
                            window.location.href = '/invoices';
                          }}
                        >
                          Create Invoice
                        </button>
                      )}
                      {quote.status === 'accepted' && hasInvoice(quote.id) && (
                        <span className="text-green-600 text-xs ml-2">Invoice Created</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Flow Insights Panel */}
      <div className='mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200 fade-in' style={{ animationDelay: '0.3s' }}>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <FileTextIcon className='h-5 w-5 mr-2 text-indigo-500' />
          Quote Flow Insights
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              {quotes.filter(q => q.status === 'accepted').length}
            </div>
            <div className='text-sm text-gray-600'>Ready for Jobs</div>
            <div className='text-xs text-gray-500 mt-1'>Accepted quotes awaiting job creation</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-blue-600'>
              {quotes.filter(q => q.status === 'sent' || q.status === 'reviewed').length}
            </div>
            <div className='text-sm text-gray-600'>Pending Response</div>
            <div className='text-xs text-gray-500 mt-1'>Awaiting client decision</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-gray-600'>
              {quotes.filter(q => q.status === 'draft').length}
            </div>
            <div className='text-sm text-gray-600'>Draft Quotes</div>
            <div className='text-xs text-gray-500 mt-1'>Ready to send to clients</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              ${quotes.reduce((sum, q) => sum + q.amount, 0).toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Total Pipeline Value</div>
            <div className='text-xs text-gray-500 mt-1'>All active quotes combined</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotesPage; 