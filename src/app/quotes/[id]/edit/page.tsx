"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { quoteOperations } from '@/lib/supabase-client';
import { Quote } from '@/lib/supabase';

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = Number(params?.id);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('draft');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const allQuotes = await quoteOperations.getAll();
        const found = allQuotes.find((q: any) => q.id === quoteId);
        if (found) {
          setQuote(found);
          setAmount(found.amount);
          setStatus(found.status);
          setValidUntil(found.valid_until ? found.valid_until.split('T')[0] : '');
          setTerms(found.terms || '');
          setNotes(found.notes || '');
        }
      } catch (err) {
        setError('Failed to load quote');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await quoteOperations.update(quoteId, {
        amount: Number(amount),
        status: status as "draft" | "sent" | "accepted" | "rejected",
        valid_until: validUntil,
        terms,
        notes
      });
      router.push('/quotes');
    } catch (err) {
      setError('Failed to update quote');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!quote) return <div>Quote not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Quote #{quote.id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="default-input w-full" min={0} step={0.01} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="default-input w-full">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Valid Until</label>
          <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="default-input w-full" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Terms</label>
          <textarea value={terms} onChange={e => setTerms(e.target.value)} className="default-textarea w-full" rows={3} />
        </div>
        <div>
          <label className="block font-medium mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="default-textarea w-full" rows={3} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
} 