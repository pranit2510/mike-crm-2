'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Lightbulb
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { leadOperations } from '@/lib/supabase-client';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { leadConversionOperations } from '@/lib/lead-conversion';
import type { Lead } from '@/lib/supabase';

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'lost'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validStatuses = [
    { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
  ];



  useEffect(() => {
    loadLeads();
    setMounted(true);
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadOperations.getAll();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };



  const handleStatusChange = async (leadId: number, newStatus: string) => {
    setStatusUpdating(leadId);
    setMessage(null);
    try {
      // Get the current lead
      const lead = leads.find(l => l.id === leadId);
      const wasQualified = lead && lead.status === 'qualified';
      if (newStatus === 'qualified') {
        await leadConversionOperations.convertLeadToClient(leadId);
        await leadOperations.update(leadId, { status: 'qualified' });
        setMessage('Lead converted to client!');
      } else {
        // If unqualifying a previously qualified/converted lead, delete the client
        if (wasQualified) {
          await leadConversionOperations.deleteClientByLeadId(leadId);
        }
        await leadOperations.update(leadId, { status: newStatus as 'new' | 'contacted' | 'qualified' | 'lost' });
        setMessage('Lead status updated.');
      }
      await loadLeads();
    } catch (err) {
      setMessage('Failed to update status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (leadId: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      setActionLoading(`delete-${leadId}`);
      await leadOperations.delete(leadId);
      await loadLeads();
    } catch (err) {
      alert('Failed to delete lead');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });



  if (loading) return <div className="p-4">Loading leads...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="fade-in">
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <Lightbulb className='mr-3 h-8 w-8 text-primary' /> Leads
        </h1>
        <Link href='/leads/new' className='btn-primary group inline-flex items-center'>
          <PlusCircle size={20} className='mr-2 group-hover:rotate-90 transition-transform duration-300' /> 
          <span>New Lead</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'new' | 'contacted' | 'qualified' | 'lost')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Enhanced Status Sorting Bar */}
      <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 fade-in' style={{ animationDelay: '0.05s' }}>
        <div className='flex flex-wrap gap-2'>
          <button
            key='all'
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-sm hover:bg-primary-dark'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>All</span>
            <span className={`text-xs font-normal ${statusFilter === 'all' ? 'text-white/80' : ''}`}>({leads.length})</span>
          </button>
          {validStatuses.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as 'new' | 'contacted' | 'qualified' | 'lost' | 'all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                statusFilter === key ? color + ' shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{label}</span>
              <span className={`text-xs font-normal ${statusFilter === key ? '' : ''}`}>({leads.filter(l => l.status === key).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Leads Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" />
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden fade-in' style={{ animationDelay: '0.2s' }}>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Contact</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Source</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Estimated Value</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='px-6 py-4 text-center text-gray-500'>
                      No leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className='table-row-hover group'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900 group-hover:text-primary transition-colors duration-200'>{lead.name}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{lead.email}</div>
                        {lead.phone && (
                          <div className='text-sm text-gray-500'>{lead.phone}</div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='relative'>
                          <select
                            value={lead.status as 'new' | 'contacted' | 'qualified' | 'lost'}
                            onChange={e => handleStatusChange(lead.id, e.target.value as 'new' | 'contacted' | 'qualified' | 'lost')}
                            className='opacity-0 absolute inset-0 w-full h-full cursor-pointer'
                            disabled={statusUpdating === lead.id}
                          >
                            {validStatuses.map(({ key }) => (
                              <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                            ))}
                          </select>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              validStatuses.find(s => s.key === lead.status)?.color || 'bg-gray-100 text-gray-800'
                            } w-full block text-center pointer-events-none`}
                          >
                            {validStatuses.find(s => s.key === lead.status)?.label || lead.status}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {typeof lead.estimated_value === 'number' && !isNaN(lead.estimated_value) ? `$${lead.estimated_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center'>
                        <Link href={`/leads/${lead.id}/edit`} className='text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-100/50 transition-all duration-200' title='Edit Lead'>
                          <Edit3 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100/50 transition-all duration-200'
                          title='Delete Lead'
                          disabled={actionLoading === `delete-${lead.id}`}
                        >
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

      {/* Flow Insights Panel */}
      <div className='mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 fade-in' style={{ animationDelay: '0.3s' }}>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <Lightbulb className='h-5 w-5 mr-2 text-blue-500' />
          Lead Flow Insights
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              {leads.filter(l => l.status === 'qualified').length}
            </div>
            <div className='text-sm text-gray-600'>Ready for Conversion</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-yellow-600'>
              {leads.filter(l => l.status === 'contacted').length}
            </div>
            <div className='text-sm text-gray-600'>Awaiting Response</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-blue-600'>
              {leads.filter(l => l.status === 'new').length}
            </div>
            <div className='text-sm text-gray-600'>New Leads</div>
          </div>
        </div>
      </div>

      {message && (
        <div className='mb-4 text-center text-sm font-medium text-green-600'>{message}</div>
      )}
    </div>
  );
};

export default LeadsPage; 