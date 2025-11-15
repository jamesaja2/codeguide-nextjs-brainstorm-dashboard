'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserAgentContextType {
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
}

const UserAgentContext = createContext<UserAgentContextType | undefined>(undefined);

export const useUserAgent = () => {
  const context = useContext(UserAgentContext);
  if (context === undefined) {
    throw new Error('useUserAgent must be used within a UserAgentProvider');
  }
  return context;
};

// Simple user agent parser
const parseUserAgent = (userAgent: string) => {
  // This is a simple parser - in production you might want to use a library like 'ua-parser-js'
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // OS detection
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    device = 'Mobile';
  }

  return { browser, os, device };
};

interface UserAgentProviderProps {
  children: ReactNode;
  initialUserAgent?: string | null;
}

export const UserAgentProvider = ({ children, initialUserAgent = null }: UserAgentProviderProps) => {
  const [userAgent, setUserAgent] = useState<string | null>(initialUserAgent);
  const [browser, setBrowser] = useState<string | null>(null);
  const [os, setOS] = useState<string | null>(null);
  const [device, setDevice] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const ua = initialUserAgent || navigator.userAgent;
      setUserAgent(ua);

      const parsed = parseUserAgent(ua);
      setBrowser(parsed.browser);
      setOS(parsed.os);
      setDevice(parsed.device);
    }
  }, [initialUserAgent]);

  const value = {
    userAgent,
    browser,
    os,
    device,
  };

  return (
    <UserAgentContext.Provider value={value}>
      {children}
    </UserAgentContext.Provider>
  );
};