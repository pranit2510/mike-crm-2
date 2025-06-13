'use client';

import React, { useState, FormEvent, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, PlusCircle, Save, User, CalendarDays } from 'lucide-react';
import { clientOperations, technicianOperations, jobOperations } from '@/lib/supabase-client';

const JobFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromQuery = searchParams?.get('clientId');

  // Dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [clientId, setClientId] = useState(clientIdFromQuery || '');
  const [description, setDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [assignedTechnicians, setAssignedTechnicians] = useState<string[]>([]);
  const [priority, setPriority] = useState('Medium');
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [clientsData, techniciansData] = await Promise.all([
        clientOperations.getAll(),
        technicianOperations.getAll()
      ]);
      setClients(clientsData || []);
      setTechnicians(techniciansData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Create a new Date object from the datetime-local input
      const startDateTime = new Date(scheduledDateTime).toISOString();

      await jobOperations.create({
        client_id: Number(clientId),
        title: description.slice(0, 50),
        description,
        status: 'pending',
        start_date: startDateTime,
        end_date: startDateTime, // Using same time for end date for now
        budget,
        priority: priority.toLowerCase() as 'low' | 'medium' | 'high',
        assigned_technicians: assignedTechnicians,
        service_address: serviceAddress,
      } as any);

      // Add to Google Calendar
      await fetch('/api/schedule-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: description.slice(0, 50),
          description,
          start: startDateTime,
          end: startDateTime,
        }),
      });

      router.push('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className='bg-white p-6 sm:p-8 rounded-lg shadow space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label htmlFor='clientId' className='form-label flex items-center'>
            <User size={14} className="mr-1.5 text-gray-400" />Client
          </label>
          <select id='clientId' value={clientId} onChange={e => setClientId(e.target.value)} className='default-select' required>
            <option value="" disabled>Select a client</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='priority' className='form-label'>Priority</label>
          <select id='priority' value={priority} onChange={e => setPriority(e.target.value)} className='default-select'>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor='serviceAddress' className='form-label'>Service Address</label>
        <input
          type='text'
          id='serviceAddress'
          value={serviceAddress}
          onChange={e => setServiceAddress(e.target.value)}
          className='default-input'
          required
        />
      </div>

      <div>
        <label htmlFor='budget' className='form-label'>Budget / Amount ($)</label>
        <input
          type='number'
          id='budget'
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className='default-input'
          min={0}
          step={0.01}
          required
        />
      </div>

      <div>
        <label htmlFor='description' className='form-label'>Job Description</label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className='default-textarea'
          required
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label htmlFor='scheduledDateTime' className='form-label flex items-center'>
            <CalendarDays size={14} className="mr-1.5 text-gray-400" />Scheduled Date
          </label>
          <input
            type="datetime-local"
            id="scheduledDateTime"
            value={scheduledDateTime}
            onChange={e => setScheduledDateTime(e.target.value)}
            className="default-input"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor='assignedTechnicians' className='form-label'>Assign Technician(s)</label>
        <select
          multiple
          id='assignedTechnicians'
          value={assignedTechnicians}
          onChange={e =>
            setAssignedTechnicians(Array.from(e.target.selectedOptions, option => option.value))
          }
          className='default-select h-24'
        >
          {technicians.map((tech: any) => (
            <option key={tech.id} value={tech.id}>{tech.name}</option>
          ))}
        </select>
        <p className='text-xs text-gray-500 mt-1'>Hold Ctrl/Cmd to select multiple.</p>
      </div>

      <div className='pt-4 border-t flex justify-end'>
        <button type="submit" className='btn-primary'>
          <Save size={18} className="mr-2" /> Create Job
        </button>
      </div>
    </form>
  );
};

const CreateJobPage = () => {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <PlusCircle className='mr-3 h-8 w-8 text-primary' /> Create New Job
        </h1>
        <Link href="/jobs" className='btn-secondary btn-sm'>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Job List
        </Link>
      </div>
      <Suspense fallback={<div className='text-center p-8'>Loading job form...</div>}>
        <JobFormContent />
      </Suspense>
    </div>
  );
};

export default CreateJobPage;
