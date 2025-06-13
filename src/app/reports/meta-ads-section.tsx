'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Facebook, TrendingUp, DollarSign, Users, MousePointer, Target, RefreshCw } from 'lucide-react';

interface MetaAdsMetrics {
  adSpend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  roi: number;
  ctr: number;
  cpc: number;
  cpa: number;
  reach: number;
  frequency: number;
  campaigns: {
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
  }[];
}

const MetaAdsSection = ({ month }: { month: string }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [metrics, setMetrics] = useState<MetaAdsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: MetaAdsMetrics = {
        adSpend: 8750.50,
        impressions: 125000,
        clicks: 8750,
        conversions: 175,
        roas: 4.2,
        roi: 320,
        ctr: 7.0,
        cpc: 1.00,
        cpa: 50.00,
        reach: 45000,
        frequency: 2.8,
        campaigns: [
          {
            name: "Summer Service Special",
            spend: 2500.00,
            impressions: 35000,
            clicks: 2450,
            conversions: 50,
            roas: 4.8
          },
          {
            name: "Emergency Service Ads",
            spend: 3250.50,
            impressions: 45000,
            clicks: 3150,
            conversions: 75,
            roas: 3.9
          },
          {
            name: "Brand Awareness",
            spend: 3000.00,
            impressions: 45000,
            clicks: 3150,
            conversions: 50,
            roas: 3.8
          }
        ]
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      setError('Failed to fetch metrics. Please try again.');
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleConnect = async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError(null);
    setIsDemoMode(false);
    try {
      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (apiKey.length < 10) {
        throw new Error('Invalid API key format');
      }
      
      await fetchMetrics();
      setIsConnected(true);
    } catch (error) {
      setError('Failed to connect. Please check your API key and try again.');
      console.error('Failed to connect to Meta Ads API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setMetrics(null);
    setError(null);
    setIsDemoMode(false);
  };

  const handleRefresh = () => {
    fetchMetrics();
  };

  if (!performance) return <div>No data for this month.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Facebook className="mr-2 text-[#1877F2]" size={22} /> Meta Ads Performance
          {isDemoMode && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Demo Data
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          {isConnected && !isDemoMode && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-3 py-1.5 text-sm text-[#1877F2] hover:bg-blue-50 rounded-md transition-colors"
            >
              <RefreshCw size={16} className={`mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          {isDemoMode && (
            <button
              onClick={() => {
                setIsDemoMode(false);
                setIsConnected(false);
                setMetrics(null);
              }}
              className="flex items-center px-3 py-1.5 text-sm text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-md transition-colors"
            >
              Connect Real API
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isConnected ? (
        <div className="p-6">
          <div className="max-w-md">
            <label htmlFor="meta-api-key" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Ads Manager API Key
            </label>
            <input
              type="password"
              id="meta-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]"
              placeholder="Enter your Meta Ads Manager API Key"
            />
            <button
              onClick={handleConnect}
              disabled={!apiKey || isLoading}
              className="mt-4 w-full bg-[#1877F2] text-white px-4 py-2 rounded-md hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Connect Meta Ads'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Main Metrics */}


          {/* Campaign Performance */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => {
                setIsDemoMode(true);
                setIsConnected(true);
                setApiKey('');
                setError(null);
                setMetrics({
                  adSpend: 8750.50,
                  impressions: 125000,
                  clicks: 8750,
                  conversions: 175,
                  roas: 4.2,
                  roi: 320,
                  ctr: 7.0,
                  cpc: 1.00,
                  cpa: 50.00,
                  reach: 45000,
                  frequency: 2.8,
                  campaigns: [
                    {
                      name: "Summer Service Special",
                      spend: 2500.00,
                      impressions: 35000,
                      clicks: 2450,
                      conversions: 50,
                      roas: 4.8
                    },
                    {
                      name: "Emergency Service Ads",
                      spend: 3250.50,
                      impressions: 45000,
                      clicks: 3150,
                      conversions: 75,
                      roas: 3.9
                    },
                    {
                      name: "Brand Awareness",
                      spend: 3000.00,
                      impressions: 45000,
                      clicks: 3150,
                      conversions: 50,
                      roas: 3.8
                    }
                  ]
                });
              }}
              className="text-sm text-[#1877F2] hover:text-[#166FE5] px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              {isDemoMode ? 'Refresh Demo Data' : 'Back to Demo'}
            </button>
            <button
              onClick={handleDisconnect}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaAdsSection; 