"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const BYPASS_CALIBRATION = true;

export default function RootIndexRedirect() {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    console.log("[ROUTE_TRACE] RootIndexRedirect useEffect START — pushing to /dashboard");
    router.push('/dashboard');
    console.log("[ROUTE_TRACE] RootIndexRedirect useEffect END — push called");
  }, [router]);

  useEffect(() => {
    const hangTimer = setTimeout(() => {
      console.log("[ROUTE_TRACE] 5s TIMEOUT — redirecting to /auth as fallback");
      setTimedOut(true);
    }, 5000);
    console.log("[ROUTE_TRACE] hangTimer set for 5000ms");

    return () => {
      clearTimeout(hangTimer);
      console.log("[ROUTE_TRACE] hangTimer cleared — component unmounted");
    };
  }, []);

  useEffect(() => {
    if (timedOut) {
      console.log("[ROUTE_TRACE] timedOut=true — replacing route with /auth");
      router.replace('/auth');
    }
  }, [timedOut, router]);

  const loading = true;

  if (loading && !BYPASS_CALIBRATION) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-xs text-neutral-500 animate-pulse">
        {timedOut ? "Connection timed out — redirecting..." : "Calibrating routing matrix parameters..."}
      </div>
    );
  }

  return null;
}