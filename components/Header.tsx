'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useUserAgent } from '@/contexts/UserAgentContext';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const Header = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { browser, os, device } = useUserAgent();

  useEffect(() => {
    // Set initial time
    const updateTime = () => {
      const time = dayjs().tz('Asia/Bangkok').format('HH:mm:ss');
      const date = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DD');
      setCurrentTime(`${date} ${time} (UTC+7)`);
    };

    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Brainstorm Dashboard
              </h1>
            </div>
          </div>

          {/* Right side - Clock and User Agent Info */}
          <div className="flex items-center space-x-6">
            {/* User Agent Info (Admin only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-medium">Device:</span>
                <span>{device || 'Unknown'}</span>
                <span className="text-gray-300">|</span>
                <span className="font-medium">Browser:</span>
                <span>{browser || 'Unknown'}</span>
                <span className="text-gray-300">|</span>
                <span className="font-medium">OS:</span>
                <span>{os || 'Unknown'}</span>
              </div>
            )}

            {/* UTC+7 Clock */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 tabular-nums">
                {currentTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};