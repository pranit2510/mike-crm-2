'use client'; // If we add interactive charts or filters later

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Briefcase,
  TrendingUp,
  FileWarning,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import dynamic from 'next/dynamic';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { channelReportOperations, type ChannelReport, leadOperations } from '@/lib/supabase-client';

const MetaAdsSection = dynamic(() => import('./meta-ads-section'), {
  loading: () => <SkeletonLoader variant="card" />
});

const MarketingChannelsSection = dynamic(() => import('./marketing-channels-section'), {
  loading: () => <SkeletonLoader variant="card" />
});

const ReportSection = ({ 
  title, 
  icon: Icon, 
  children,
  onClick,
  delay = 0
}: { 
  title: string, 
  icon?: React.ElementType, 
  children: React.ReactNode,
  onClick?: () => void,
  delay?: number 
}) => (
  <div 
    className='bg-white rounded-lg shadow-sm border border-gray-200 card-hover cursor-pointer group fade-in'
    style={{ animationDelay: `${delay}s` }}
    onClick={onClick}
  >
    <div className="p-6 border-b border-gray-200">
      <h2 className='text-xl font-semibold text-gray-800 flex items-center group-hover:text-[#1877F2] transition-colors duration-200'>
        {Icon && <Icon size={22} className="mr-2 text-[#1877F2] group-hover:scale-110 transition-transform duration-200" />} {title}
      </h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [selectedClient, setSelectedClient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [channelData, setChannelData] = useState<ChannelReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [leadConversionData, setLeadConversionData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    // Fetch channel data for the chart
    async function load() {
      if (!selectedMonth) return;
      const data = await channelReportOperations.getByMonth(selectedMonth);
      setChannelData(data || []);
    }
    load();
    // Fetch all leads for lead conversion chart
    async function loadLeads() {
      const leads = await leadOperations.getAll();
      // Aggregate by source
      const summary: Record<string, { total: number; qualified: number }> = {};
      leads.forEach((lead: any) => {
        const src = lead.source || 'Unknown';
        if (!summary[src]) summary[src] = { total: 0, qualified: 0 };
        summary[src].total += 1;
        if (lead.status === 'qualified' || lead.status === 'converted' || lead.status === 'client') {
          summary[src].qualified += 1;
        }
      });
      setLeadConversionData(
        Object.entries(summary).map(([source, { total, qualified }]) => ({
          source,
          total,
          qualified,
        }))
      );
    }
    loadLeads();
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const handleFilterApply = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Applying filters:', { dateRange, selectedClient });
      // TODO: Implement actual filter logic
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportClick = (reportType: string) => {
    console.log('View detailed report:', reportType);
    // TODO: Implement navigation to detailed report view
  };

  const chartData = channelData.map(channel => ({
    channel: channel.channel,
    revenue: channel.revenue,
    cost: channel.cost,
    leads: channel.leads,
    jobs: channel.jobs,
  }));

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className='flex justify-between items-center mb-6 fade-in'>
        <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
          <BarChart3 className='mr-3 h-8 w-8 text-[#1877F2]' /> Reports
        </h1>
      </div>

      {/* Global Filters for Reports */}
      <div className='mb-8 bg-white rounded-lg shadow-sm border border-gray-200 fade-in' style={{ animationDelay: '0.1s' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className='text-lg font-semibold text-gray-800 flex items-center'>
            <Filter size={18} className="mr-2 text-[#1877F2]"/> Global Report Filters
          </h3>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end'>
            <div className="md:col-span-2 xl:col-span-1">
              <label htmlFor='report-date-from' className='block text-sm font-medium text-gray-700 mb-2'>From Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type='date' 
                  id='report-date-from' 
                  name='report-date-from' 
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className='default-input pl-10' 
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
            <div className="md:col-span-2 xl:col-span-1">
              <label htmlFor='report-date-to' className='block text-sm font-medium text-gray-700 mb-2'>To Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type='date' 
                  id='report-date-to' 
                  name='report-date-to' 
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className='default-input pl-10' 
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
            <div>
              <label htmlFor='report-client-filter' className='block text-sm font-medium text-gray-700 mb-2'>Client (Optional)</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  id='report-client-filter' 
                  name='report-client-filter'
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className='default-select pl-10 pr-8 appearance-none bg-white'
                >
                  <option value="">All Clients</option>
                  <option value="client1">John Smith</option>
                  <option value="client2">Sarah Johnson</option>
                  <option value="client3">Mike Davis</option>
                  <option value="client4">Lisa Wilson</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <button 
                onClick={handleFilterApply}
                disabled={isLoading}
                className='w-full btn-primary flex items-center justify-center'
              >
                {isLoading ? (
                  <>
                    <span className="spinner mr-2" />
                    Applying...
                  </>
                ) : (
                  'Apply Filters'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {isPageLoading ? (
          <>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </>
        ) : (
          <>
            {/* Marketing Channels - Full Width */}
            <div className="lg:col-span-2">
              <MarketingChannelsSection />
            </div>

            <ReportSection 
              title="Revenue Report" 
              icon={DollarSign}
              onClick={() => handleReportClick('revenue')}
              delay={0.2}
            >
              <div className="mb-4">
                <label className="font-medium mr-2">Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
              <p className='text-gray-600 text-sm mb-4'>Chart and data table showing revenue by period (e.g., monthly, quarterly) and by client.</p>
              <div className='h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1877F2] transition-all duration-200 group-hover:bg-gray-100'>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
                    <Bar dataKey="cost" fill="#F59E42" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ReportSection>

            <ReportSection 
              title="Job Completion Report" 
              icon={Briefcase}
              onClick={() => handleReportClick('jobs')}
              delay={0.25}
            >
              <p className='text-gray-600 text-sm mb-4'>Metrics on jobs completed, average time to completion, etc.</p>
              <div className='h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1877F2] transition-all duration-200 group-hover:bg-gray-100'>
                Job Completion Chart/Stats Placeholder
              </div>
            </ReportSection>

            <ReportSection 
              title="Lead Conversion Report" 
              icon={TrendingUp}
              onClick={() => handleReportClick('leads')}
              delay={0.3}
            >
              <p className='text-gray-600 text-sm mb-4'>Compare number of leads and qualified leads by source.</p>
              <div className='h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1877F2] transition-all duration-200 group-hover:bg-gray-100'>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={leadConversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#4F46E5" name="Leads" />
                    <Bar dataKey="qualified" fill="#22C55E" name="Qualified" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ReportSection>

            <ReportSection 
              title="Invoice Aging Report" 
              icon={FileWarning}
              onClick={() => handleReportClick('invoices')}
              delay={0.35}
            >
              <p className='text-gray-600 text-sm mb-4'>Breakdown of unpaid invoices by age (e.g., 0-30 days, 31-60 days, 60+ days).</p>
              <div className='h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1877F2] transition-all duration-200 group-hover:bg-gray-100'>
                Invoice Aging Chart/Table Placeholder
              </div>
            </ReportSection>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 