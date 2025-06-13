"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { channelReportOperations, type ChannelReport } from '@/lib/supabase-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ChannelData extends ChannelReport {
  id: number;
  channel_name: string;
  cost: number;
  leads: number;
  jobs: number;
  revenue: number;
  month: string;
}

const MarketingChannelsSection = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<ChannelData>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await channelReportOperations.getByMonth(selectedMonth);
      setChannelData(data || []);
    } catch (error) {
      console.error('Error loading channel data:', error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    load();
  }, [load]);

  // Calculate derived metrics for a channel
  const calculateChannelMetrics = (channel: ChannelData) => {
    const closeRate = channel.leads > 0 ? (channel.jobs / channel.leads) * 100 : 0;
    const costPerLead = channel.leads > 0 ? channel.cost / channel.leads : 0;
    const costPerJob = channel.jobs > 0 ? channel.cost / channel.jobs : 0;
    const roi = channel.cost > 0 ? ((channel.revenue - channel.cost) / channel.cost) * 100 : 0;
    return { closeRate, costPerLead, costPerJob, roi };
  };

  // Calculate totals
  const calculateTotals = () => {
    const filteredData = channelData;
    const totalCost = filteredData.reduce((sum, channel) => sum + channel.cost, 0);
    const totalLeads = filteredData.reduce((sum, channel) => sum + channel.leads, 0);
    const totalJobs = filteredData.reduce((sum, channel) => sum + channel.jobs, 0);
    const totalRevenue = filteredData.reduce((sum, channel) => sum + channel.revenue, 0);
    const overallCloseRate = totalLeads > 0 ? (totalJobs / totalLeads) * 100 : 0;
    const overallCostPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;
    const overallCostPerJob = totalJobs > 0 ? totalCost / totalJobs : 0;
    const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    return {
      totalCost,
      totalLeads,
      totalJobs,
      totalRevenue,
      overallCloseRate,
      overallCostPerLead,
      overallCostPerJob,
      overallROI
    };
  };

  const totals = calculateTotals();
  const currentMonthData = channelData;

  // Month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    setNewChannel((prev) => ({ ...prev, month: newMonth }));
  };

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Edit handlers
  const handleEditStart = (channel: ChannelData) => {
    setEditingId(channel.id);
    setNewChannel({ ...channel });
  };

  async function handleEditSave() {
    if (editingId == null || !newChannel) return;
    await channelReportOperations.update(editingId, newChannel);
    setEditingId(null);
    setNewChannel({});
    load();
  }

  const handleEditCancel = () => {
    setEditingId(null);
    setNewChannel({});
  };

  async function handleAddChannel() {
    if (!newChannel.channel_name) return;
    await channelReportOperations.create(newChannel as ChannelData);
    setNewChannel({
      month: selectedMonth,
      channel_name: '',
      cost: 0,
      leads: 0,
      jobs: 0,
      revenue: 0,
      close_rate: 0,
      cost_per_lead: 0,
      roi: 0,
    });
    setIsAddingNew(false);
    load();
  }

  async function handleDeleteChannel(id: number) {
    await channelReportOperations.delete(id);
    load();
  }

  const chartData = channelData.map(channel => ({
    channel: channel.channel_name,
    revenue: channel.revenue,
    cost: channel.cost,
    leads: channel.leads,
    jobs: channel.jobs,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <BarChart3 className="mr-2 text-[#1877F2]" size={22} /> Marketing Channels Performance
          </h2>
          
          {/* Month Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-500 hover:text-[#1877F2] hover:bg-blue-50 rounded-md transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-[#1877F2]" />
              <span className="text-lg font-medium text-gray-700 min-w-[140px] text-center">
                {formatMonthDisplay(selectedMonth)}
              </span>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-500 hover:text-[#1877F2] hover:bg-blue-50 rounded-md transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#1877F2] transition-colors">
            <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
              <DollarSign size={16} className="mr-1 text-[#1877F2]" /> Total Ad Spend
            </h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${totals.totalCost.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#1877F2] transition-colors">
            <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
              <DollarSign size={16} className="mr-1 text-[#1877F2]" /> Total Revenue
            </h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${totals.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#1877F2] transition-colors">
            <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
              <TrendingUp size={16} className="mr-1 text-[#1877F2]" /> Overall ROI
            </h3>
            <p className="text-2xl font-semibold text-gray-900">
              {totals.overallROI.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#1877F2] transition-colors">
            <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
              <Target size={16} className="mr-1 text-[#1877F2]" /> Close Rate
            </h3>
            <p className="text-2xl font-semibold text-gray-900">
              {totals.overallCloseRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Channels Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMonthData.map((channel) => {
                const metrics = calculateChannelMetrics(channel);
                const isEditing = editingId === channel.id;
                
                return (
                  <tr key={channel.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={newChannel.channel_name || ''}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, channel_name: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{channel.channel_name}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newChannel.cost || 0}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, cost: Number(e.target.value) }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">${channel.cost.toLocaleString()}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newChannel.leads || 0}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, leads: Number(e.target.value) }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">{channel.leads}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newChannel.jobs || 0}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, jobs: Number(e.target.value) }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">{channel.jobs}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newChannel.revenue || 0}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">${channel.revenue.toLocaleString()}</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{metrics.closeRate.toFixed(1)}%</span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">${metrics.costPerLead.toFixed(2)}</span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.roi.toFixed(1)}%
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(channel)}
                              className="p-1 text-[#1877F2] hover:text-[#166FE5] hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteChannel(channel.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Add New Channel Row */}
              {isAddingNew && (
                <tr className="bg-blue-50 border-2 border-[#1877F2] border-dashed">
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={newChannel.channel_name || ''}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, channel_name: e.target.value }))}
                      placeholder="Channel name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                      autoFocus
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={newChannel.cost || 0}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={newChannel.leads || 0}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, leads: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={newChannel.jobs || 0}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, jobs: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={newChannel.revenue || 0}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400">Auto</td>
                  <td className="px-4 py-4 text-sm text-gray-400">Auto</td>
                  <td className="px-4 py-4 text-sm text-gray-400">Auto</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleAddChannel}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingNew(false);
                          setNewChannel({
                            month: selectedMonth,
                            channel_name: '',
                            cost: 0,
                            leads: 0,
                            jobs: 0,
                            revenue: 0,
                            close_rate: 0,
                            cost_per_lead: 0,
                            roi: 0,
                          });
                        }}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Channel Button */}
        {!isAddingNew && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center px-4 py-2 text-sm text-[#1877F2] hover:text-[#166FE5] hover:bg-blue-50 border border-[#1877F2] rounded-md transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Channel
            </button>
          </div>
        )}

        {/* Summary Row */}
        {currentMonthData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Avg Cost/Lead:</span>
                <span className="ml-2 font-medium text-gray-900">${totals.overallCostPerLead.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Avg Cost/Job:</span>
                <span className="ml-2 font-medium text-gray-900">${totals.overallCostPerJob.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Leads:</span>
                <span className="ml-2 font-medium text-gray-900">{totals.totalLeads}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Jobs:</span>
                <span className="ml-2 font-medium text-gray-900">{totals.totalJobs}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingChannelsSection; 