'use client';

import React, { useState, useEffect, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Trash2, Save, Send, Info, Hash, CalendarDays, User, Package, Percent, ScrollText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'; // For leadId pre-fill
import { clientOperations, quoteOperations } from '@/lib/supabase-client';

// Mock client data for dropdown
const mockClients = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alice Brown' },
  { id: '4', name: 'Robert Green' },
  // Add mock lead data if we want to pre-select leads
  { id: 'L001', name: 'Sarah Connor (Lead)' }, 
];

const defaultTerms = "1. All payments are due within 30 days of invoice date.\n2. A late fee of 1.5% per month will be applied to overdue invoices.\n3. All work is guaranteed for a period of 90 days from completion.";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CreateQuoteForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromQuery = searchParams?.get('clientId');

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState(clientIdFromQuery || '');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>('draft');
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await clientOperations.getAll();
        setClients(data);
      } catch (err) {
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await quoteOperations.create({
        client_id: Number(clientId),
        job_id: null,
        amount: Number(amount),
        status,
        valid_until: validUntil,
        terms,
        notes
      });
      router.push('/quotes');
    } catch (err) {
      setError('Failed to create quote');
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <PlusCircle className='mr-3 h-8 w-8 text-primary' /> Create New Quote
        </h1>
        <Link href="/quotes" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Quotes List
        </Link>
      </div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">{error}</div>}
      <form className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-8' onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='clientId' className='form-label'>Client</label>
            <select id='clientId' name='clientId' value={clientId} onChange={e => setClientId(e.target.value)} className='default-select' required>
              <option value='' disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='amount' className='form-label'>Amount</label>
            <input type='number' id='amount' name='amount' value={amount} onChange={e => setAmount(Number(e.target.value))} className='default-input' min='0' step='0.01' required />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='status' className='form-label'>Status</label>
            <select id='status' name='status' value={status} onChange={e => setStatus(e.target.value as any)} className='default-select' required>
              <option value='draft'>Draft</option>
              <option value='sent'>Sent</option>
              <option value='accepted'>Accepted</option>
              <option value='rejected'>Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor='validUntil' className='form-label'>Valid Until</label>
            <input type='date' id='validUntil' name='validUntil' value={validUntil} onChange={e => setValidUntil(e.target.value)} className='default-input' required />
          </div>
        </div>
        <div>
          <label htmlFor='terms' className='form-label'>Terms</label>
          <textarea id='terms' name='terms' value={terms} onChange={e => setTerms(e.target.value)} className='default-textarea' rows={3} />
        </div>
        <div>
          <label htmlFor='notes' className='form-label'>Notes</label>
          <textarea id='notes' name='notes' value={notes} onChange={e => setNotes(e.target.value)} className='default-textarea' rows={3} />
        </div>
        <div className='pt-4 border-t flex justify-end'>
          <button type="submit" className='btn-primary' disabled={loading}>
            <Save size={18} className="mr-2" /> {loading ? 'Saving...' : 'Save Quote'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Page = () => (
  <Suspense>
    <CreateQuoteForm />
  </Suspense>
);

// Add .input-sm to globals.css for smaller input fields if needed
// .input-sm { @apply py-1.5 text-xs; }

export default Page; 