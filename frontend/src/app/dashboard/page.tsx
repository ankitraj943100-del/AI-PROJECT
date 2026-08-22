'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { DocUploader } from '@/components/dashboard/DocUploader';
import { FloatingAiAssistant } from '@/components/ai/FloatingAiAssistant';
import {
  FileText,
  Sparkles,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDocuments();
    }
  }, [user, loading, router]);

  const loadDocuments = async () => {
    try {
      const data = await fetchApi('/api/documents');
      setDocuments(data.documents);
    } catch (err) {
      console.error('Failed loading documents:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    router.push(`/documents/${newDoc._id}`);
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
        <div className="flex items-center gap-3 text-indigo-400">
          <Sparkles className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-gray-300">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI PDF Orchestrator</h1>
            <p className="text-xs text-gray-400">Task Extraction & Event Streaming Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-semibold">{user?.name}</span>
          </div>

          <GlassButton
            onClick={() => {
              logout();
              router.push('/login');
            }}
            variant="ghost"
            className="px-3 py-1.5 text-xs gap-1.5 text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </GlassButton>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-indigo-900/40 via-slate-900 to-cyan-950/40 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20 mb-3">
              Event-Driven Pipeline Active
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Transform PDFs into Actionable Intelligence
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Upload any document to trigger automated Kafka event ingestion, AI executive summarization, task checklist extraction, and deadline scheduling.
            </p>
          </div>
        </div>

        {/* PDF Ingestion Section */}
        <DocUploader onUploadSuccess={handleDocumentUploaded} />

        {/* Documents Workspace Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Document Workspaces ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <GlassCard className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No documents uploaded yet</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Drag and drop your first PDF document above to kickstart AI text extraction and task creation.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <GlassCard
                  key={doc._id}
                  glowColor="indigo"
                  onClick={() => router.push(`/documents/${doc._id}`)}
                  className="cursor-pointer group hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        doc.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : doc.status === 'processing'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                    {doc.summary?.overview || 'Click to view extracted summary and tasks.'}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform">
                      Open <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Assistant Drawer */}
      <FloatingAiAssistant />
    </div>
  );
}
