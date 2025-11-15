import { NextRequest, NextResponse } from 'next/server';
import { Address4, Address6 } from 'ip-address';

// Parse CIDR ranges from environment variable
const getCIDRRanges = (): string[] => {
  const allowedCIDR = process.env.ALLOWED_CIDR;
  if (!allowedCIDR) {
    console.warn('ALLOWED_CIDR environment variable not set. Allowing all IPs for development.');
    return [];
  }
  return allowedCIDR.split(',').map(range => range.trim());
};

// Check if IP is within allowed CIDR ranges
const isIPAllowed = (ip: string): boolean => {
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

// Extract client IP from request
const getClientIP = (request: NextRequest): string => {
  // Check X-Forwarded-For header first (common when behind proxy)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  // Fall back to remote address
  const remoteAddr = request.ip ||
                    request.headers.get('x-real-ip') ||
                    request.headers.get('x-client-ip') ||
                    request.headers.get('cf-connecting-ip') || // Cloudflare
                    request.headers.get('x-cluster-client-ip') ||
                    'unknown';

  return remoteAddr;
};

// Check SEB_ALLOWED_KEY for additional security
const hasValidSEBKey = (request: NextRequest): boolean => {
  const sebKey = process.env.SEB_ALLOWED_KEY;
  if (!sebKey) {
    // If SEB_ALLOWED_KEY is not configured, skip this check
    return true;
  }

  const requestKey = request.headers.get('x-seb-key') ||
                     request.headers.get('seb-key');

  return requestKey === sebKey;
};

// Paths that don't require IP/SEB validation
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
  '/api/auth/sign-in',
  '/api/auth/sign-up',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

// Check if path is public
const isPublicPath = (pathname: string): boolean => {
  return publicPaths.some(path => pathname.startsWith(path));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip validation for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Extract client IP
  const clientIP = getClientIP(request);
  console.log(`Request from IP: ${clientIP} to path: ${pathname}`);

  // Check IP whitelisting
  if (!isIPAllowed(clientIP)) {
    console.log(`Access denied for IP: ${clientIP}`);
    return NextResponse.json(
      { error: 'Access denied. Your IP address is not allowed.' },
      { status: 403 }
    );
  }

  // Check SEB key if configured
  if (!hasValidSEBKey(request)) {
    console.log(`Access denied for invalid SEB key from IP: ${clientIP}`);
    return NextResponse.json(
      { error: 'Access denied. Invalid security key.' },
      { status: 403 }
    );
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};