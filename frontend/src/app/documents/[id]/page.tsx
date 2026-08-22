'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { DocumentItem, TaskItem, TeamMemberItem } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { TaskKanban } from '@/components/dashboard/TaskKanban';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { TeamModal } from '@/components/dashboard/TeamModal';
import { FloatingAiAssistant } from '@/components/ai/FloatingAiAssistant';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Users,
  CheckSquare,
  Calendar,
  Bookmark,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'deadlines'>('summary');
  const [loading, setLoading] = useState(true);
  const [sseStatus, setSseStatus] = useState<string>('');
  const [sseProgress, setSseProgress] = useState<number>(0);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (docId) {
      loadDocumentDetails();
      subscribeToProgressSSE();
    }
  }, [docId, user, authLoading]);

  const loadDocumentDetails = async () => {
    try {
      const data = await fetchApi(`/api/documents/${docId}`);
      setDocument(data.document);
      setTasks(data.tasks || []);
      setTeamMembers(data.teamMembers || []);
    } catch (err) {
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProgressSSE = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${API_URL}/api/documents/${docId}/progress`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) {
          setSseProgress(data.progress);
          setSseStatus(data.message);
        }
        if (data.status === 'completed' && data.payload) {
          setDocument(data.payload);
          loadDocumentDetails(); // Refresh tasks
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const data = await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleCreateTask = async (taskData: Partial<TaskItem>) => {
    try {
      const data = await fetchApi('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          documentId: docId,
          ...taskData,
        }),
      });

      setTasks((prev) => [...prev, data.task]);
    } catch (err) {
      console.error('Failed creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetchApi(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error('Failed deleting task:', err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
        <div className="flex items-center gap-3 text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-gray-300">Loading Document Intelligence...</span>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] p-8 text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <GlassButton onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 text-xs">
          Return to Dashboard
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-gray-100 flex flex-col">
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {document.title}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  document.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {document.status}
              </span>
            </h1>
            <p className="text-xs text-gray-400">Original File: {document.originalName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            onClick={() => setIsTeamModalOpen(true)}
            variant="secondary"
            className="px-3.5 py-2 text-xs gap-2"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Add People ({teamMembers.length})
          </GlassButton>
        </div>
      </header>

      {/* Real-time Progress Bar Banner (if processing) */}
      {document.status === 'processing' && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-cyan-900/60 border-b border-white/10 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs mb-1">
            <span className="text-indigo-200 font-semibold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              {sseStatus || 'Analyzing PDF document with Google Gemini AI...'}
            </span>
            <span className="text-cyan-400 font-bold">{sseProgress}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${sseProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Executive Summary
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Action Items ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'deadlines'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> Deadlines ({document.deadlines?.length || 0})
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'summary' && (
          <ExecutiveSummary summary={document.summary} documentTitle={document.title} />
        )}

        {activeTab === 'tasks' && (
          <TaskKanban
            tasks={tasks}
            teamMembers={teamMembers}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'deadlines' && <CalendarView deadlines={document.deadlines} />}
      </main>

      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        documentId={docId}
        members={teamMembers}
        onMemberAdded={(m) => setTeamMembers((prev) => [...prev, m])}
        onMemberRemoved={(id) => setTeamMembers((prev) => prev.filter((m) => m._id !== id))}
      />

      {/* Floating AI Assistant Drawer */}
      <FloatingAiAssistant documentId={docId} documentTitle={document.title} />
    </div>
  );
}
