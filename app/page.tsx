"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Forward root landing page hit indices straight into our layout dashboard engine path
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-xs text-neutral-500 animate-pulse">
      Calibrating routing matrix parameters...
    </div>
  );
}