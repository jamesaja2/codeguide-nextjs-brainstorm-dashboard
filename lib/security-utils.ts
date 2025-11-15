import { Address4, Address6 } from 'ip-address';

// Parse CIDR ranges from environment variable
export const getCIDRRanges = (): string[] => {
  const allowedCIDR = process.env.ALLOWED_CIDR;
  if (!allowedCIDR) {
    console.warn('ALLOWED_CIDR environment variable not set. Allowing all IPs for development.');
    return [];
  }
  return allowedCIDR.split(',').map(range => range.trim());
};

// Check if IP is within allowed CIDR ranges
export const isIPAllowed = (ip: string): boolean => {
  const cidrRanges = getCIDRRanges();

  // If no CIDR ranges are configured, allow all IPs (development mode)
  if (cidrRanges.length === 0) {
    return true;
  }

  try {
    // Try to parse as IPv4 first, then IPv6
    let clientIP: Address4 | Address6;
    try {
      clientIP = new Address4(ip);
    } catch {
      clientIP = new Address6(ip);
    }

    // Check against each CIDR range
    for (const range of cidrRanges) {
      try {
        if (range.includes('.')) {
          // IPv4 CIDR
          const cidr = new Address4(range);
          if (clientIP instanceof Address4 && clientIP.isInSubnet(cidr)) {
            return true;
          }
        } else {
          // IPv6 CIDR
          const cidr = new Address6(range);
          if (clientIP instanceof Address6 && clientIP.isInSubnet(cidr)) {
            return true;
          }
        }
      } catch (error) {
        console.warn(`Invalid CIDR range: ${range}`, error);
      }
    }

    return false;
  } catch (error) {
    console.warn(`Invalid IP address: ${ip}`, error);
    return false;
  }
};

// Extract client IP from request headers
export const getClientIP = (headers: Headers): string => {
  // Check X-Forwarded-For header first (common when behind proxy)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  // Try other common headers
  const possibleHeaders = [
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-cluster-client-ip',
  ];

  for (const header of possibleHeaders) {
    const ip = headers.get(header);
    if (ip) {
      return ip;
    }
  }

  return 'unknown';
};

// Check SEB_ALLOWED_KEY for additional security
export const hasValidSEBKey = (headers: Headers): boolean => {
  const sebKey = process.env.SEB_ALLOWED_KEY;
  if (!sebKey) {
    // If SEB_ALLOWED_KEY is not configured, skip this check
    return true;
  }

  const requestKey = headers.get('x-seb-key') ||
                     headers.get('seb-key');

  return requestKey === sebKey;
};

// Role-based access control utilities
export type UserRole = 'admin' | 'participant';

export const isAdmin = (user: { role?: string }): boolean => {
  return user?.role === 'admin';
};

export const isParticipant = (user: { role?: string }): boolean => {
  return user?.role === 'participant';
};

export const hasRole = (user: { role?: string }, requiredRole: UserRole): boolean => {
  return user?.role === requiredRole;
};

export const hasAnyRole = (user: { role?: string }, roles: UserRole[]): boolean => {
  return user?.role ? roles.includes(user.role as UserRole) : false;
};

// API route protection helpers
export const requireAuth = (user: any, requiredRole?: UserRole) => {
  if (!user) {
    throw new Error('Authentication required');
  }

  if (requiredRole && !hasRole(user, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
};

export const requireAdmin = (user: any) => requireAuth(user, 'admin');

export const requireParticipant = (user: any) => requireAuth(user, 'participant');