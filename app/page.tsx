"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    console.log("[ROUTE_TRACE] RootIndexRedirect useEffect START — pushing to /dashboard");
    router.push('/dashboard');
    console.log("[ROUTE_TRACE] RootIndexRedirect useEffect END — push called");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-xs text-neutral-500 animate-pulse">
      Calibrating routing matrix parameters...
    </div>
  );
}