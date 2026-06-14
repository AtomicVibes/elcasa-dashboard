import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type') ?? 'email-verification';

  console.log(JSON.stringify({
    event: 'auth.callback',
    type,
    hasToken: !!token,
  }));

  if (!token) {
    return NextResponse.redirect(new URL('/auth?error=no_token', requestUrl.origin));
  }

  const destination = type === 'recovery'
    ? `/reset-password?token=${token}`
    : `/auth?verified=true`;

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
