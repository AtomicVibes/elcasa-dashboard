# Migrating Arcadia Dashboard from Supabase Auth to Neon Auth

This guide walks you through migrating your Arcadia Dashboard from Supabase Auth to Neon Auth with Better Auth.

## Prerequisites

- Neon project with Auth enabled
- Node.js 22.x
- Next.js 16.2.6 (App Router)

## Step 1: Install Neon Auth SDK

Remove Supabase dependencies and install Neon Auth[(1)](https://neon.com/docs/auth/quick-start/nextjs-api-only):

```bash
npm uninstall @supabase/supabase-js @supabase/ssr
npm install @neondatabase/auth@latest

Step 2: Set Up Environment Variables
Replace your Supabase environment variables with Neon Auth configuration1.

Remove:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
Add to .env.local:

NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=your-secret-at-least-32-characters-long
Get your Auth URL from the Neon Console under Auth → Configuration1.

Generate the cookie secret with1:

bash
openssl rand -base64 32
Step 3: Create Auth Server Instance
Create lib/auth/server.ts1:

typescript
import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
This unified instance provides all server-side auth functionality: .handler() for API routes, .middleware() for route protection, .getSession() and all Better Auth server methods1.

Step 4: Set Up Auth API Routes
Create app/api/auth/[...path]/route.ts1:

typescript
import { auth } from '@/lib/auth/server';

export const { GET, POST } = auth.handler();
This proxies all authentication API calls from your client1.

Step 5: Update Middleware
Replace your existing middleware.ts with2:

typescript
import { auth } from '@/lib/auth/server';

export default auth.middleware({
  loginUrl: '/auth',
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    '/dashboard/:path*',
    '/onboarding/:path*',
    
    // Do not run middleware for static resources
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
The middleware automatically validates session cookies, provides session data to server components, redirects unauthenticated users, and refreshes session tokens when needed2.

Step 6: Create Auth Client
Create lib/auth/client.ts for client-side operations1:

typescript
'use client';

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();
Step 7: Update Sign-In Logic
Create app/auth/sign-in/actions.ts1:

typescript
'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signIn.email({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to sign in. Try again' };
  }

  redirect('/dashboard');
}
Step 8: Update Sign-Up Logic
Create app/auth/sign-up/actions.ts1:

typescript
'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: "Email address must be provided." }
  }

  const { error } = await auth.signUp.email({
    email,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to create account' };
  }

  redirect('/dashboard');
}
Step 9: Update Protected Pages
Replace Supabase session checks in your dashboard pages. Example for app/dashboard/page.tsx1:

typescript
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

// Server components using auth methods must be rendered dynamically
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth');
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Your dashboard content */}
    </div>
  );
}
Apply this pattern to all protected routes:

/dashboard/cases
/dashboard/jobs
/dashboard/leave-requests
/dashboard/media
/dashboard/customers
/dashboard/team
/dashboard/settings
Step 10: Update Sign-Out Logic
Create a sign-out action1:

typescript
'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  await auth.signOut();
  redirect('/auth');
}
Use it in your UI components:

typescript
import { signOut } from '@/app/auth/actions';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
Step 11: Replace AuthContext (Optional)
Your current AuthContext can be simplified or removed. Neon Auth handles session management automatically through HTTP-only cookies2.

If you need client-side session access, use the useSession hook from the auth client:

typescript
'use client';

import { authClient } from '@/lib/auth/client';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => setSession(data));
  }, []);

  return session;
}
Step 12: Update API Routes
Replace Supabase client calls in your API routes. Example for /api/customers/route.ts:

typescript
import { auth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: session } = await auth.getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your database query logic
  // Use session.user.id to filter data by user
}
Step 13: Remove Old Auth Files
Delete these Supabase-related files:

lib/auth/auth-manager.ts
Any Supabase client initialization files
Old auth context files (if replacing with Neon Auth)
Step 14: Update Database Schema
Neon Auth stores authentication data in your database. The required tables are automatically created when you enable Auth in your Neon project1.

You can query users directly:

sql
SELECT * FROM neon_auth.users;
Step 15: Test Authentication Flow
Start your development server:
bash
npm run dev
Test the following flows:
Sign up with email/password
Sign in with email/password
Access protected dashboard routes
Sign out
Password reset (if implemented)
Migration Benefits
Simplified Architecture
Before: 3-layer auth (middleware + AuthContext + AuthManager)
After: Single unified auth instance with automatic session management2
Branching Support
Authentication state branches with your database, so preview and CI environments get isolated users and sessions1.

Database as Source of Truth
All auth data lives in your Neon database. No external dependencies or sync delays3.

Automatic Session Management
Session cookies are HTTP-only, secure, and managed entirely by the SDK with automatic refresh2.

Simplified Configuration
One environment variable (NEON_AUTH_BASE_URL) instead of multiple Supabase keys3.

Troubleshooting
Safari Cookie Issues
Safari blocks third-party cookies on non-HTTPS connections. Use1:

bash
npm run dev -- --experimental-https
Then open https://localhost:3000.

Server Logging
Enable debug logging to troubleshoot auth issues2:

typescript
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
  logLevel: 'debug', // or 'silent' to disable logging
});
Next Steps


DOCUMENTATIONS:
https://neon.com/docs/auth/overview
https://neon.com/docs/auth/quick-start/nextjs-api-only
https://neon.com/docs/auth/authentication-flow
https://neon.com/docs/auth/guides/email-verification