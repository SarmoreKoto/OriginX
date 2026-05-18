// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const fcmToken = request.cookies.get('fcm_token');

  if (!fcmToken) {
    return NextResponse.redirect(new URL('/authentication/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home'],
};
