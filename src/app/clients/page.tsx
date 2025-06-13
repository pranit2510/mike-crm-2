'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, TrendingUp, DollarSign, Calendar, ArrowUpCircle, ChevronDown } from 'lucide-react';
import FlowActions from '@/components/ui/FlowActions';
import { clientOperations, jobOperations, invoiceOperations, quoteOperations } from '@/lib/supabase-client';
import type { Client } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Enhanced Client interface for flow functionality
interface EnhancedClient extends Client {
  flowStatus: ClientStatus;
  leadSource?: string;
  lastJobDate?: string;
  totalJobs: number;
  totalRevenue: number;
  lastContact?: string;
  estimated_value: number;
  source: string;
}

type ClientStatus = 'Prospective' | 'Active' | 'VIP' | 'Inactive';

const ClientsPage = () => {
  const [clients, setClients] = useState<EnhancedClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<EnhancedClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load clients from database
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all related data for proper flow status calculation
      const [clientsData, allJobs, allInvoices] = await Promise.all([
        clientOperations.getAll(),
        jobOperations.getAll(),
        invoiceOperations.getAll()
      ]);
      
      // Enhance clients with real flow data
      const enhancedClients: EnhancedClient[] = clientsData.map(client => {
        // Get client's jobs and invoices
        const clientJobs = allJobs.filter((job: any) => job.client_id === client.id);
        const clientInvoices = allInvoices.filter((invoice: any) => invoice.client_id === client.id);
        
        // Calculate real metrics
        const totalJobs = clientJobs.length;
        const completedJobs = clientJobs.filter((job: any) => job.status === 'completed').length;
        const totalRevenue = clientInvoices
          .filter((inv: any) => inv.status === 'paid')
          .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
        
        // Get last job date
        const lastJobDate = clientJobs.length > 0 
          ? clientJobs
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              .created_at
          : undefined;
        
        // Determine proper flow status based on business rules
        const flowStatus = determineFlowStatus(client);
        
        console.log(client.name, flowStatus, client.status, totalJobs, completedJobs, totalRevenue);
        
        return {
          ...client,
          flowStatus,
          leadSource: client.source,
          lastJobDate,
          totalJobs,
          totalRevenue,
          lastContact: client.created_at,
          estimated_value: client.estimated_value,
          source: client.source,
        };
      });
      
      setClients(enhancedClients);
      setFilteredClients(enhancedClients);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Proper flow status determination based on documented business rules
  const determineFlowStatus = (client: Client): ClientStatus => {
    if (client.status === 'inactive') return 'Inactive';
    if (client.status === 'active') return 'Active';
    // Optionally, if you have a 'prospective' status in DB:
    if (client.status === 'prospective') return 'Prospective';
    return 'Prospective'; // fallback
  };

  // Filter clients based on search and status
  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(client => client.flowStatus === statusFilter);
    }

    setFilteredClients(filtered);
  }, [searchTerm, statusFilter, clients]);

  const getStatusCounts = () => {
    return {
      All: clients.length,
      Prospective: clients.filter(c => c.flowStatus === 'Prospective').length,
      Active: clients.filter(c => c.flowStatus === 'Active').length,
      Inactive: clients.filter(c => c.flowStatus === 'Inactive').length,
    };
  };

  const getStatusColor = (status: ClientStatus) => {
    const colors = {
      'Prospective': 'bg-blue-100 text-blue-700',
      'Active': 'bg-green-100 text-green-700',
      'VIP': 'bg-purple-100 text-purple-700',
      'Inactive': 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  const statusCounts = getStatusCounts();

  // Add this function after the determineFlowStatus function
  const updateClientStatus = async (clientId: string | number, newStatus: ClientStatus) => {
    try {
      await clientOperations.update(Number(clientId), {
        status: newStatus === 'Inactive' ? 'inactive' : 'active'
      });
      loadClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      alert('Failed to update client status');
    }
  };

  // Add this function after updateClientStatus
  const deleteClient = async (clientId: string | number) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
    try {
      await clientOperations.delete(Number(clientId));
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  // StatusDropdown: Clean and connect to DB for 'prospective', 'active', 'inactive'
  const StatusDropdown = ({ client }: { client: EnhancedClient }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statusOptions = [
      { label: 'Prospective', value: 'prospective' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ];
    const currentStatus = client.flowStatus.charAt(0).toUpperCase() + client.flowStatus.slice(1);
    const statusColor = getStatusColor(currentStatus as ClientStatus);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
        >
          {currentStatus}
          <ChevronDown size={12} className="ml-1" />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={async () => {
                  setIsOpen(false);
                  if (option.value !== client.flowStatus) {
                    await clientOperations.update(client.id, { status: option.value === 'inactive' ? 'inactive' : 'active' });
                    const newStatus = option.value.charAt(0).toUpperCase() + option.value.slice(1) as ClientStatus;
                    setClients(prev => prev.map(c => c.id === client.id ? { ...c, flowStatus: newStatus } : c));
                    setFilteredClients(prev => prev.map(c => c.id === client.id ? { ...c, flowStatus: newStatus } : c));
                  }
                }}
                className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${option.value === client.flowStatus ? 'bg-gray-100' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Clients</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadClients}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <Users className='mr-3 h-8 w-8 text-primary' /> 
          Clients ({clients.length})
        </h1>
        <Link href='/clients/new' className='btn-primary group'>
          <Plus size={20} className='mr-2 group-hover:rotate-90 transition-transform duration-300' /> 
          Add New Client
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === status 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className='mb-6 relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
        <input
          type='text'
          placeholder='Search clients by name, email, or company...'
          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clients Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden fade-in' style={{ animationDelay: '0.2s' }}>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Client Directory ({filteredClients.length} {statusFilter !== 'All' ? statusFilter : ''} clients)
          </h2>
        </div>
        
        {filteredClients.length === 0 ? (
          <div className='p-12 text-center'>
            <Users className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No clients found</h3>
            <p className='text-gray-500 mb-4'>
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
            </p>
            <Link href='/clients/new' className='btn-primary'>
              <Plus size={20} className='mr-2' /> Add First Client
            </Link>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Client</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Contact</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Estimated Value</th>
            
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Business Metrics</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredClients.map((client, index) => (
                  <tr key={client.id} className='hover:bg-gray-50 transition-colors duration-150' style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{client.name}</div>
                        <div className='text-xs text-gray-400'>Added {new Date(client.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>{client.email}</div>
                      <div className='text-sm text-gray-500'>{client.phone}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <StatusDropdown client={client} />
                      {client.leadSource && (
                        <div className='text-xs text-gray-500 mt-1'>Source: {client.leadSource}</div>
                      )}
                      <div className='text-xs text-gray-600 mt-1'></div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-green-700'>${client.estimated_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </td>
                    
                    
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center'>
                          <DollarSign className='h-4 w-4 text-green-500 mr-1' />
                          <span>${client.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className='flex items-center'>
                          <Calendar className='h-4 w-4 text-blue-500 mr-1' />
                          <span>{client.totalJobs} jobs</span>
                        </div>
                      </div>
                      {client.lastJobDate && (
                        <div className='text-xs text-gray-400 mt-1'>
                          Last job: {new Date(client.lastJobDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Progress to VIP indicator */}
                     
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex items-center space-x-2'>
                        <FlowActions 
                          module="clients"
                          status={client.flowStatus.charAt(0).toUpperCase() + client.flowStatus.slice(1) as ClientStatus}
                          entityId={client.id.toString()}
                          onAction={(action, id) => {
                            if (action === 'createQuote') {
                              router.push(`/quotes/new?clientId=${id}`);
                            }
                          }}
                        />
                        <button
                          onClick={() => deleteClient(client.id)}
                          className='text-red-600 hover:text-red-800 ml-2 px-2 py-1 rounded border border-red-200 bg-red-50 text-xs font-semibold'
                          title='Delete Client'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage; 