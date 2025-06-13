'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  FileText,
  Download,
  Send,
  Eye,
  Edit3,
  Trash2,
  DollarSign,
  Clock
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import FlowActions from '@/components/ui/FlowActions';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { invoiceStages, type InvoiceStatus } from '@/lib/flowStates';
import { invoiceOperations, clientOperations, jobOperations, quoteOperations } from '@/lib/supabase-client';

// Enhanced invoice type with flow status
interface EnhancedInvoice {
  id: string;
  clientId: string;
  clientName: string;
  jobId?: string;
  jobTitle?: string;
  quoteId?: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  status: InvoiceStatus;
  paymentTerms: string;
  sentDate?: string;
  viewedDate?: string;
  paidDate?: string;
  reminderCount?: number;
  lastReminderDate?: string;
  description: string;
  overdueDays?: number;
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [overdueFilter, setOverdueFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Status counts for the sorting bar - using flow states
  const statusCounts = {
    All: invoices.length,
    ...Object.keys(invoiceStages).reduce((acc, status) => {
      acc[status] = invoices.filter(invoice => invoice.status === status).length;
      return acc;
    }, {} as Record<string, number>)
  };

  useEffect(() => {
    setMounted(true);
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceOperations.getAll();
      setInvoices(data || []);

      const quotes = await quoteOperations.getAll();
      quotes.forEach(quote => {
        console.log(quote.clients?.name); // Client's name for each quote
      });
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowAction = async (action: string, invoiceId: string) => {
    setActionLoading(`${action}-${invoiceId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setActionLoading(null);
    
    switch (action) {
      case 'sendReminder':
        console.log(`Sending payment reminder for invoice ${invoiceId}`);
        break;
      default:
        console.log(`${action} for invoice ${invoiceId}`);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = String(invoice.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.jobTitle && invoice.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    const matchesOverdue = overdueFilter === 'All' || 
                          (overdueFilter === 'Overdue' && invoice.status === 'Overdue') ||
                          (overdueFilter === 'Not Overdue' && invoice.status !== 'Overdue');
    return matchesSearch && matchesStatus && matchesOverdue;
  });

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'Paid' && inv.status !== 'Draft')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter(inv => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fade-in">
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <FileText className='mr-3 h-8 w-8 text-primary' /> Invoices / Billing
        </h1>
        <Link href='/invoices/new' className='btn-primary group inline-flex items-center'>
          <PlusCircle size={20} className='mr-2 group-hover:rotate-90 transition-transform duration-300' />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Enhanced Status Sorting Bar */}
      <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 fade-in' style={{ animationDelay: '0.05s' }}>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                statusFilter === status
                  ? status === 'All'
                    ? 'bg-primary text-white shadow-sm hover:bg-primary-dark'
                    : invoiceStages[status as InvoiceStatus]?.color || 'bg-gray-100 text-gray-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{status}</span>
              <span className={`text-xs font-normal ${
                statusFilter === status && status === 'All'
                  ? 'text-white/80'
                  : ''
              }`}>
                ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 fade-in' style={{ animationDelay: '0.1s' }}>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='search'
                placeholder='Search invoices by ID, client, or job title...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='default-input pl-10 w-full'
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <select
              value={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.value)}
              className='default-select'
            >
              <option value="All">All Invoices</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Not Overdue">Not Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Invoices Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" />
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden fade-in' style={{ animationDelay: '0.2s' }}>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Invoice ID</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Client & Job</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Due Date</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Payment Terms</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='px-6 py-12 text-center text-sm text-gray-500'>
                      {searchTerm ? 'No invoices found matching your criteria.' : 'No invoices found. Start by creating a new invoice.'}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className='table-row-hover group'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className='text-sm font-medium text-primary hover:text-primary-dark group-hover:underline transition-all duration-200'
                        >
                          {invoice.id}
                        </Link>
                        {invoice.quoteId && (
                          <div className='text-xs text-gray-500'>
                            from {invoice.quoteId}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <Link 
                          href={`/clients/${invoice.clients?.id}`} 
                          className='text-sm font-medium text-gray-900 hover:text-primary transition-colors duration-200'
                        >
                          {invoice.clients?.name || 'Unknown Client'}
                        </Link>
                        {invoice.jobs?.title && (
                          <div className='text-sm text-gray-600 max-w-xs truncate' title={invoice.jobs.title}>
                            Job: {invoice.jobs.title}
                          </div>
                        )}
                        {invoice.jobs?.id && (
                          <div className='text-xs text-gray-500'>
                            Job ID: {invoice.jobs.id}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-semibold text-gray-900'>
                          ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {invoice.paidAmount && (
                          <div className='text-xs text-green-600'>
                            Paid: ${invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <select
                          value={invoice.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as 'draft' | 'sent' | 'paid' | 'overdue';
                            await invoiceOperations.update(invoice.id, { status: newStatus });
                            setInvoices((prev) => prev.map((inv) => inv.id === invoice.id ? { ...inv, status: newStatus } : inv));
                          }}
                          className='default-select text-sm px-2 py-1 rounded w-full min-w-[110px]'
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        {invoice.overdueDays && (
                          <div className='text-xs text-red-600 mt-1 flex items-center'>
                            <Clock size={12} className='mr-1' />
                            {invoice.overdueDays} days overdue
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className={`text-sm ${invoice.status === 'Overdue' ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {invoice.dueDate}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Issued: {invoice.invoiceDate}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {invoice.payment_terms || invoice.paymentTerms || '-'}
                        {invoice.reminderCount !== undefined && invoice.reminderCount > 0 && (
                          <div className='text-xs text-orange-600 mt-1'>
                            {invoice.reminderCount} reminder{invoice.reminderCount > 1 ? 's' : ''} sent
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <FlowActions
                          module="invoices"
                          status={invoice.status}
                          entityId={invoice.id}
                          onAction={handleFlowAction}
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1 flex items-center'>
                        <Link 
                          href={`/invoices/${invoice.id}`} 
                          className='text-primary hover:text-primary-dark p-1 rounded hover:bg-primary/10 transition-all duration-200' 
                          title='View Invoice'
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          href={`/invoices/${invoice.id}/edit`} 
                          className='text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-100/50 transition-all duration-200' 
                          title='Edit Invoice'
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          className='text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100/50 transition-all duration-200' 
                          title='Download PDF'
                          onClick={async () => {
                            try {
                              await invoiceOperations.downloadPDF(invoice.id);
                            } catch (error) {
                              console.error('Error downloading invoice:', error);
                              // You might want to show a toast notification here
                            }
                          }}
                        >
                          <Download size={18} />
                        </button>
                        {invoice.status === 'Draft' && (
                          <button 
                            className='text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100/50 transition-all duration-200' 
                            title='Send Invoice'
                          >
                            <Send size={18} />
                          </button>
                        )}
                        <button className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100/50 transition-all duration-200' title='Delete Invoice'>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Flow Insights Panel */}
      <div className='mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200 fade-in' style={{ animationDelay: '0.3s' }}>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <DollarSign className='h-5 w-5 mr-2 text-emerald-500' />
          Invoice Flow Insights
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              ${totalPaid.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Total Paid</div>
            <div className='text-xs text-gray-500 mt-1'>
              {invoices.filter(inv => inv.status === 'Paid').length} paid invoice{invoices.filter(inv => inv.status === 'Paid').length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-blue-600'>
              ${totalOutstanding.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Outstanding</div>
            <div className='text-xs text-gray-500 mt-1'>Awaiting payment</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-red-600'>
              ${totalOverdue.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Overdue</div>
            <div className='text-xs text-gray-500 mt-1'>
              {invoices.filter(inv => inv.status === 'Overdue').length} overdue invoice{invoices.filter(inv => inv.status === 'Overdue').length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-gray-600'>
              {invoices.filter(inv => inv.status === 'Draft').length}
            </div>
            <div className='text-sm text-gray-600'>Draft Invoices</div>
            <div className='text-xs text-gray-500 mt-1'>Ready to send</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage; 