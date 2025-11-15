'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  role?: 'admin' | 'participant';
}

const adminNavigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'News', href: '/admin/news' },
  { name: 'Companies', href: '/admin/companies' },
  { name: 'Participants', href: '/admin/participants' },
];

const participantNavigation = [
  { name: 'Home', href: '/dashboard' },
  { name: 'News', href: '/dashboard/news' },
  { name: 'Home', href: '/dashboard/home' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Portfolio', href: '/dashboard/portfolio' },
];

export const DashboardLayout = ({ children, role = 'participant' }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const navigation = role === 'admin' ? adminNavigation : participantNavigation;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                                  (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};