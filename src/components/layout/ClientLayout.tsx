'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { supabase } from '@/lib/supabase';

// Pages that don't require authentication
const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password'];

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isPublicPage = publicPages.includes(pathname);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserInfo(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading VoltFlow CRM...</p>
        </div>
      </div>
    );
  }

  // For public pages or when user is not authenticated, show minimal layout
  if (isPublicPage || !user) {
    // Temporarily allow access without authentication for UI testing
    if (isPublicPage) {
      return <div className="min-h-screen">{children}</div>;
    } else {
      // Show the full layout even without authentication for demo purposes
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      );
    }
  }

  // For authenticated users, show full layout
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ClientLayout; 