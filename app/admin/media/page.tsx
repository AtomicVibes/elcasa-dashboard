"use client";

import Sidebar from '@/app/components/Sidebar';
import PhotosMedia from '@/components/PhotosMedia';

export default function MediaDashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-gray-900 dark:text-white">
      <Sidebar />
      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#0e0e0e] overflow-y-auto">
        <PhotosMedia />
      </main>
    </div>
  );
}
