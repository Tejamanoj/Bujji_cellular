import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

async function verifyHmacSha256(jwtToken: string, secret: string): Promise<any | null> {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Convert Base64URL signature to ArrayBuffer
    const sigBuffer = base64UrlToArrayBuffer(signatureB64);
    const dataBuffer = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    // Import HMAC key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify('HMAC', key, sigBuffer, dataBuffer);
    if (!isValid) return null;

    // Decode payload
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (e) {
    console.error('❌ Middleware JWT verification error:', e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes except /admin/verify-otp
  if (path.startsWith('/admin') && path !== '/admin/verify-otp') {
    const sessionCookie = request.cookies.get('bujji_admin_session');
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const secret = process.env.JWT_SECRET || 'bujji_cellulars_secure_admin_jwt_secret_key_32_chars';
    const payload = await verifyHmacSha256(sessionCookie.value, secret);

    if (!payload) {
      // Session invalid or expired: clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('bujji_admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
