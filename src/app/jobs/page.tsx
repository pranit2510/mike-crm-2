'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Briefcase,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import FlowActions from '@/components/ui/FlowActions';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { jobOperations, technicianOperations } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

// Add a type for jobs fetched from the database
interface DBJob {
  id: number;
  client_id: number;
  clients?: { name: string; address?: string };
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: string;
  start_date?: string;
  start_time?: string;
  estimated_duration?: string;
  actual_duration?: string;
  budget?: number;
  actual_cost?: number;
  completion_percentage?: number;
  updated_at?: string;
  assigned_technicians?: string[];
  service_address?: string;
}

// Update the JobStatus type
type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Update the jobStages object
const jobStages: Record<JobStatus, { color: string; description: string }> = {
  pending: { color: 'bg-blue-100 text-blue-700', description: 'Job is scheduled' },
  in_progress: { color: 'bg-yellow-100 text-yellow-700', description: 'Job is in progress' },
  completed: { color: 'bg-green-100 text-green-700', description: 'Job is completed' },
  cancelled: { color: 'bg-red-100 text-red-700', description: 'Job is cancelled' },
};

// Update the job operations interface
interface JobOperations {
  create(job: Omit<DBJob, "id" | "created_at">): Promise<any>;
  getAll(): Promise<any[]>;
  getByClientId(clientId: number): Promise<any[]>;
  delete(id: number): Promise<any>;
  update(id: number, data: Partial<DBJob>): Promise<any>;
}

const JobsPage = () => {
  const [jobs, setJobs] = useState<ReturnType<typeof mapJobToUI>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const router = useRouter();

  // Fetch jobs from database
  useEffect(() => {
    setMounted(true);
    loadJobs();
    async function fetchTechs() {
      const techs = await technicianOperations.getAll();
      setTechnicians(techs || []);
    }
    fetchTechs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobOperations.getAll();
      // Map jobs to UI format
      const jobsList = (data || []).map(mapJobToUI);
      setJobs(jobsList);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  function mapJobToUI(job: DBJob) {
    // Only allow valid JobStatus values
    const allowedStatuses: JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
    let status: JobStatus = 'pending';
    if (allowedStatuses.includes((job.status as JobStatus))) {
      status = job.status as JobStatus;
    }

    // Format date and time
    const formatDateTime = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateStr;
      }
    };

    return {
      id: job.id,
      clientId: job.client_id,
      clientName: job.clients?.name || 'Unknown',
      title: job.title,
      description: job.description,
      status,
      priority: job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Medium',
      assignedTo: job.assigned_to || '',
      scheduledDate: formatDateTime(job.start_date),
      estimatedDuration: job.estimated_duration || '',
      actualDuration: job.actual_duration || '',
      budgetAmount: job.budget || 0,
      actualCost: job.actual_cost || null,
      completionPercentage: job.completion_percentage || null,
      lastUpdate: job.updated_at ? new Date(job.updated_at).toLocaleDateString() : '',
      address: job.service_address || '',
      assigned_technicians: job.assigned_technicians || [],
    };
  }

  function getTechnicianNames(ids: string[]) {
    return ids
      .map(id => {
        const tech = technicians.find(t => t.id.toString() === id.toString());
        return tech ? tech.name : id;
      })
      .join(', ');
  }

  // Update statusCounts to use real jobs
  const statusCounts = {
    All: jobs.length,
    ...jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const handleFlowAction = async (action: string, jobId: string) => {
    setActionLoading(`${action}-${jobId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setActionLoading(null);
    
    switch (action) {
      case 'createInvoice':
        console.log(`Creating invoice for job ${jobId}`);
        break;
      default:
        console.log(`${action} for job ${jobId}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDelete = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await jobOperations.delete(jobId);
      loadJobs();
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="fade-in">
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-dark flex items-center'>
          <Briefcase className='mr-3 h-8 w-8 text-primary' /> Jobs / Work Orders
        </h1>
        <Link href='/jobs/new' className='btn-primary group inline-flex items-center'>
          <PlusCircle size={20} className='mr-2 group-hover:rotate-90 transition-transform duration-300' />
          <span>Create New Job</span>
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
                    : jobStages[status as JobStatus]?.color || 'bg-gray-100 text-gray-700'
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
                placeholder='Search jobs by ID, client, title, or technician...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='default-input pl-10 w-full'
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className='default-select'
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Jobs Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" />
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden fade-in' style={{ animationDelay: '0.2s' }}>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Job ID</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Client & Title</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Priority</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Assigned To</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Address</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Budget</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date Scheduled</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='px-6 py-12 text-center text-sm text-gray-500'>
                      {searchTerm ? 'No jobs found matching your criteria.' : 'No jobs found. Start by creating a new job.'}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className='table-row-hover group'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Link 
                          href={`/jobs/${job.id}`}
                          className='text-sm font-medium text-primary hover:text-primary-dark group-hover:underline transition-all duration-200'
                        >
                          {job.id}
                        </Link>
                      </td>
                      <td className='px-6 py-4'>
                        <Link 
                          href={`/clients/${job.clientId}`} 
                          className='text-sm font-medium text-gray-900 hover:text-primary transition-colors duration-200'
                        >
                          {job.clientName}
                        </Link>
                        <div className='text-sm text-gray-600 max-w-xs truncate' title={job.title}>
                          {job.title}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority === 'Urgent' && <AlertCircle size={12} className='mr-1' />}
                          {job.priority}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <select
                          value={job.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as JobStatus;
                            await jobOperations.update(job.id, { status: newStatus });
                            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
                          }}
                          className={`px-2 py-1 rounded-md text-sm font-medium border transition-colors duration-200 ${
                            jobStages[job.status as JobStatus]?.color || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="pending">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-md'>
                        {Array.isArray(job.assigned_technicians) && job.assigned_technicians.length > 0
                          ? getTechnicianNames(job.assigned_technicians)
                          : job.assignedTo || <span className='text-gray-400'>Unassigned</span>}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {job.address || <span className='text-gray-400'>-</span>}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 font-medium'>
                          ${job.budgetAmount.toLocaleString()}
                        </div>
                        {job.actualCost && (
                          <div className={`text-xs ${job.actualCost > job.budgetAmount ? 'text-red-600' : 'text-green-600'}`}>
                            Actual: ${job.actualCost.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {job.scheduledDate ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{job.scheduledDate}</span>
                            {job.estimatedDuration && (
                              <span className="text-xs text-gray-500 mt-1">
                                Est. Duration: {job.estimatedDuration}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className='text-gray-400'>Not scheduled</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1 flex items-center'>
                        <Link 
                          href={`/jobs/${job.id}/edit`} 
                          className='text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-100/50 transition-all duration-200' 
                          title='Edit Job'
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100/50 transition-all duration-200' 
                          title='Delete Job'
                          onClick={() => handleDelete(job.id)}
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

      {/* Job Flow Insights Panel */}
      <div className='mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200 fade-in' style={{ animationDelay: '0.3s' }}>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <Briefcase className='h-5 w-5 mr-2 text-orange-500' />
          Job Flow Insights
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-blue-600'>
              {jobs.filter(j => j.status === 'pending').length}
            </div>
            <div className='text-sm text-gray-600'>Scheduled Jobs</div>
            <div className='text-xs text-gray-500 mt-1'>Awaiting completion</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className='text-sm text-gray-600'>Completed</div>
            <div className='text-xs text-gray-500 mt-1'>Successfully finished</div>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='text-2xl font-bold text-red-600'>
              {jobs.filter(j => j.status === 'cancelled').length}
            </div>
            <div className='text-sm text-gray-600'>Cancelled</div>
            <div className='text-xs text-gray-500 mt-1'>Jobs that were cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage; 