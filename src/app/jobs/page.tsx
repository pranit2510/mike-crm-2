"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import type { Job } from '@/types/job.d.ts';
import type { JobStatus } from '@/lib/flowStates';
import StatusBadge from '@/components/ui/StatusBadge';
import FlowActions from '@/components/ui/FlowActions';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const mapJobStatus = (status: string): JobStatus => {
  switch (status) {
    case 'pending': return 'Scheduled';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return 'Scheduled';
  }
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = jobs.filter(job =>
    job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={() => router.push('/jobs/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Job
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} variant="list-item" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.client_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{job.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge module="jobs" status={mapJobStatus(job.status)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <FlowActions
                      module="jobs"
                      status={mapJobStatus(job.status)}
                      entityId={job.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 