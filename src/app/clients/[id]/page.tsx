'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // To get the client ID
import { ArrowLeft, Edit3, PlusCircle, User, Briefcase, FileText, Receipt, MessageSquare } from 'lucide-react';

// Mock data - In a real app, fetch this from your API based on ID
const mockClientsData = [
  {
    id: '1',
    name: 'John Doe',
    company: 'Doe Construction',
    phones: [{ type: 'Mobile', number: '555-1234' }, { type: 'Work', number: '555-1111' }],
    emails: [{ type: 'Primary', address: 'john.doe@example.com' }],
    addresses: [
      { type: 'Service', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
      { type: 'Billing', street: 'PO Box 100', city: 'New York', state: 'NY', zip: '10002' },
    ],
    notes: 'Prefers morning appointments. Key under the mat.',
    lastServiceDate: '2023-10-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    company: 'Smith Electricians',
    phones: [{ type: 'Mobile', number: '555-5678' }],
    emails: [{ type: 'Primary', address: 'jane.smith@example.com' }, { type: 'Secondary', address: 'jane.s@work.com' }],
    addresses: [
      { type: 'Service', street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001' },
    ],
    notes: 'Always call before arriving.',
    lastServiceDate: '2023-11-01',
  },
  // Add more mock clients if needed to match IDs from client list page
];

const ClientDetailPage = () => {
  const params = useParams();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState('info');

  // Find the client - in a real app, this would be an API call
  const client = mockClientsData.find(c => c.id === clientId);

  if (!client) {
    return (
      <div>
        <Link href="/clients" className='inline-flex items-center text-primary hover:underline mb-4'>
          <ArrowLeft size={18} className="mr-2" /> Back to Clients
        </Link>
        <p className='text-red-500 text-center text-xl'>Client not found.</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Contact Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm'>
                <div><strong>Company:</strong> {client.company || 'N/A'}</div>
                <div><strong>Primary Email:</strong> {client.emails.find(e=>e.type === 'Primary')?.address || 'N/A'}</div>
                <div><strong>Primary Phone:</strong> {client.phones.find(p=>p.type === 'Mobile' || p.type === 'Work')?.number || 'N/A'}</div>
              </div>
            </div>
            {client.phones.length > 0 && (
              <div>
                <h4 className='text-md font-medium text-gray-600 mb-1'>All Phone Numbers:</h4>
                {client.phones.map((phone, idx) => (
                  <p key={idx} className='text-sm'><strong>{phone.type}:</strong> {phone.number}</p>
                ))}
              </div>
            )}
            {client.emails.length > 1 && (
              <div>
                <h4 className='text-md font-medium text-gray-600 mb-1'>Other Emails:</h4>
                {client.emails.filter(e=>e.type !== 'Primary').map((email, idx) => (
                  <p key={idx} className='text-sm'><strong>{email.type}:</strong> {email.address}</p>
                ))}
              </div>
            )}
            {client.addresses.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2 mt-4'>Addresses</h3>
                {client.addresses.map((address, idx) => (
                  <div key={idx} className='mb-2 p-3 bg-gray-50 rounded'>
                    <p className='text-sm font-medium'>{address.type} Address:</p>
                    <p className='text-sm'>{address.street}, {address.city}, {address.state} {address.zip}</p>
                  </div>
                ))}
              </div>
            )}
            {client.notes && (
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2 mt-4'>Notes</h3>
                <p className='text-sm p-3 bg-yellow-50 border border-yellow-200 rounded whitespace-pre-wrap'>{client.notes}</p>
              </div>
            )}
          </div>
        );
      case 'jobs':
        return <div className='p-4 bg-gray-50 rounded'>Job History (Placeholder) - Table of jobs for this client.</div>;
      case 'quotes':
        return <div className='p-4 bg-gray-50 rounded'>Quotes (Placeholder) - Table of quotes for this client.</div>;
      case 'invoices':
        return <div className='p-4 bg-gray-50 rounded'>Invoices (Placeholder) - Table of invoices for this client.</div>;
      case 'communication':
        return <div className='p-4 bg-gray-50 rounded'>Communication Log (Placeholder) - Log of emails/calls.</div>;
      default:
        return null;
    }
  };

  const tabItems = [
    { id: 'info', label: 'Client Information', icon: User },
    { id: 'jobs', label: 'Job History', icon: Briefcase },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'communication', label: 'Communication Log', icon: MessageSquare },
  ];

  return (
    <div>
      <div className='mb-6'>
        <Link href="/clients" className='inline-flex items-center text-sm text-primary hover:underline mb-3'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Client List
        </Link>
        <div className='flex flex-col md:flex-row justify-between md:items-center'>
          <h1 className='text-3xl font-bold text-dark mb-2 md:mb-0 flex items-center'>
            <User className="mr-3 h-8 w-8 text-primary" /> {client.name}
          </h1>
          <div className='flex space-x-3'>
            <Link href={`/clients/${client.id}/edit`} className='btn-secondary'>
              <Edit3 size={18} className="mr-2" /> Edit Client
            </Link>
            <Link href={`/jobs/new?clientId=${client.id}`} className='btn-primary'>
              <PlusCircle size={18} className="mr-2" /> New Job for Client
            </Link>
          </div>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg'>
        {/* Tabs Navigation */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-1 sm:space-x-4 px-4 overflow-x-auto' aria-label='Tabs'>
            {tabItems.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap flex items-center py-3 px-1 sm:px-3 border-b-2 font-medium text-sm 
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage; 