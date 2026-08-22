'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
      <div className="flex items-center gap-3 text-indigo-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium text-gray-300">Initializing PDF Orchestrator...</span>
      </div>
    </div>
  );
}
