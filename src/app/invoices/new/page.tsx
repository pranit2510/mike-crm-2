'use client';

import React, { useState, useEffect, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Save,
  Send,
  Info,
  Hash,
  CalendarDays,
  User,
  Package,
  DollarSign,
  Percent,
  FileText as FileTextIcon, // For pull from quote
  Briefcase, // For pull from job
  CreditCard, // For Record Payment
  Plus,
  Minus
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { invoiceOperations, clientOperations } from '@/lib/supabase-client';

const defaultPaymentTerms = "Payment is due within 30 days. Late payments are subject to a 5% fee.";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const InvoiceFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams?.get('jobId');
  const quoteIdFromQuery = searchParams?.get('quoteId');

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [paymentTerms, setPaymentTerms] = useState(defaultPaymentTerms);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0); // Percentage
  const [paymentsMade, setPaymentsMade] = useState(0);

  useEffect(() => {
    async function fetchClients() {
      const data = await clientOperations.getAll();
      setClients(data || []);
    }
    fetchClients();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ));
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const amountDue = grandTotal - paymentsMade;

  const handleSubmit = async (e: FormEvent, status: string) => {
    e.preventDefault();
    await invoiceOperations.create({
      client_id: Number(clientId),
      amount: grandTotal,
      status: status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
      due_date: dueDate,
      payment_terms: paymentTerms,
      notes,
      job_id: jobIdFromQuery ? Number(jobIdFromQuery) : 0,
      quote_id: quoteIdFromQuery ? Number(quoteIdFromQuery) : 0
    });
    router.push('/invoices');
  };

  const handlePullFromJob = () => {
    alert('Pulling data from Job (mock). Client and line items will be updated.');
    setClientId('1'); // Mock: Assume Job J001 for John Doe
    setLineItems([
      { id: crypto.randomUUID(), description: 'Job Task 1', quantity: 2, unitPrice: 100 },
      { id: crypto.randomUUID(), description: 'Job Materials', quantity: 1, unitPrice: 250 }
    ]);
  };

  const handlePullFromQuote = () => {
    alert('Pulling data from Quote (mock). Client and line items will be updated.');
    setClientId('2'); // Mock: Assume Quote Q002 for Jane Smith
    setLineItems([
      { id: crypto.randomUUID(), description: 'Quote Service 1', quantity: 1, unitPrice: 500 },
      { id: crypto.randomUUID(), description: 'Quote Materials', quantity: 2, unitPrice: 150 }
    ]);
  };

  return (
    <form className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-8'>
      {/* Client, Invoice Info & Data Pull */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div>
          <label htmlFor='clientId' className='form-label flex items-center'>Client</label>
          <select id='clientId' name='clientId' value={clientId} onChange={(e) => setClientId(e.target.value)} className='default-select' required>
            <option value="" disabled>Select a client</option>
            {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor='invoiceDate' className='form-label flex items-center'>Invoice Date</label>
          <input type='date' id='invoiceDate' value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className='default-input' required/>
        </div>
        <div>
          <label htmlFor='dueDate' className='form-label flex items-center'>Due Date</label>
          <input type='date' id='dueDate' value={dueDate} onChange={(e) => setDueDate(e.target.value)} className='default-input' required/>
        </div>
        <div className='md:col-span-3 flex flex-wrap gap-2 items-end'>
          <button type='button' onClick={handlePullFromJob} className='btn-secondary btn-sm flex items-center'>
              <Briefcase size={14} className='mr-1.5' /> Pull from Job
          </button>
          <button type='button' onClick={handlePullFromQuote} className='btn-secondary btn-sm flex items-center'>
              <FileTextIcon size={14} className='mr-1.5' /> Pull from Quote
          </button>
        </div>
      </section>

      {/* Line Items Section - same as quotes */}
      <section>
        <h2 className='text-xl font-semibold text-gray-800 mb-3 flex items-center'><Package size={20} className="mr-2 text-primary"/>Line Items</h2>
        <div className='space-y-3'>
          {lineItems.map((item, index) => (
            <div key={item.id} className='grid grid-cols-12 gap-x-3 gap-y-2 items-center p-3 border rounded-md bg-gray-50/50'>
              <div className='col-span-12 sm:col-span-5'>
                {index === 0 && <label className='form-label text-xs'>Description</label>}
                <input type='text' placeholder='Service or Material Description' value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} className='default-input input-sm' />
              </div>
              <div className='col-span-4 sm:col-span-2'>
                {index === 0 && <label className='form-label text-xs'>Qty</label>}
                <input type='number' placeholder='1' value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)} className='default-input input-sm text-right' min='0' step='any'/>
              </div>
              <div className='col-span-4 sm:col-span-2'>
                {index === 0 && <label className='form-label text-xs'>Unit Price</label>}
                <input type='number' placeholder='0.00' value={item.unitPrice} onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)} className='default-input input-sm text-right' min='0' step='0.01' />
              </div>
              <div className='col-span-3 sm:col-span-2'>
                {index === 0 && <label className='form-label text-xs'>Total</label>}
                <input type='text' value={`$${(item.quantity * item.unitPrice).toFixed(2)}`} className='default-input input-sm text-right bg-gray-100' disabled />
              </div>
              <div className='col-span-1 flex items-end justify-end'>
                {index > 0 && <button type='button' onClick={() => handleRemoveLineItem(item.id)} className='text-red-500 hover:text-red-700 p-1 mt-4 sm:mt-0' title='Remove'><Trash2 size={18} /></button>}
              </div>
            </div>
          ))}
        </div>
        <button type='button' onClick={handleAddLineItem} className='btn-secondary btn-sm mt-4'><PlusCircle size={16} className="mr-1.5" /> Add Line Item</button>
      </section>

      {/* Totals Section */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-6 border-t'>
        <div className='md:col-span-2'></div>
        <div className='space-y-3 text-sm'>
          <div className='flex justify-between'><span className='font-medium text-gray-600'>Subtotal:</span><span className='font-semibold text-gray-800'>${subtotal.toFixed(2)}</span></div>
          <div className='flex justify-between items-center'>
            <label htmlFor='taxRate' className='form-label mb-0 flex items-center'><Percent size={14} className="mr-1.5 text-gray-400"/>Tax Rate (%):</label>
            <input type='number' id='taxRate' value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className='default-input input-sm w-20 text-right' min='0' step='0.01' />
          </div>
          <div className='flex justify-between'><span className='font-medium text-gray-600'>Tax Amount:</span><span className='font-semibold text-gray-800'>${taxAmount.toFixed(2)}</span></div>
          <div className='flex justify-between font-semibold text-md border-t pt-2 mt-2'><span className='text-gray-700'>Grand Total:</span><span className='text-gray-900'>${grandTotal.toFixed(2)}</span></div>
          <div className='flex justify-between items-center pt-2 border-t'>
            <label htmlFor='paymentsMade' className='form-label mb-0 flex items-center'><DollarSign size={14} className="mr-1.5 text-gray-400"/>Payments Made:</label>
            <input type='number' id='paymentsMade' value={paymentsMade} onChange={(e) => setPaymentsMade(parseFloat(e.target.value) || 0)} className='default-input input-sm w-28 text-right' min='0' step='0.01' />
          </div>
          <div className='flex justify-between text-lg font-bold text-primary border-t pt-2 mt-2'><span >Amount Due:</span><span>${amountDue.toFixed(2)}</span></div>
        </div>
      </section>
      
      {/* Payment Instructions, Notes */}
      <section className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t'>
        <div>
          <label htmlFor='paymentTerms' className='form-label flex items-center'><Info size={14} className="mr-1.5 text-gray-400"/>Payment Instructions/Terms</label>
          <textarea id='paymentTerms' value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={4} className='default-textarea'></textarea>
        </div>
        <div>
          <label htmlFor='invoiceNotes' className='form-label flex items-center'><Info size={14} className="mr-1.5 text-gray-400"/>Internal Notes (Optional)</label>
          <textarea id='invoiceNotes' value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className='default-textarea'></textarea>
        </div>
      </section>

      {/* Action Buttons */}
      <section className='pt-6 border-t flex flex-wrap gap-3 justify-end'>
        <button type='button' onClick={(e) => handleSubmit(e, 'Draft')} className='btn-secondary'>Save as Draft</button>
        <button type='button' onClick={(e) => handleSubmit(e, 'Paid')} className='btn-secondary'>Mark as Paid</button>
        <button type='submit' onClick={(e) => handleSubmit(e, 'Sent')} className='btn-primary'>Send Invoice</button>
      </section>
    </form>
  );
};

const CreateInvoicePage = () => {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <PlusCircle className='mr-3 h-8 w-8 text-primary' /> Create New Invoice
        </h1>
        <Link href="/invoices" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Invoices
        </Link>
      </div>
      <Suspense fallback={<div className='text-center p-8'>Loading invoice details...</div>}>
        <InvoiceFormContent />
      </Suspense>
    </div>
  );
};

export default CreateInvoicePage; 