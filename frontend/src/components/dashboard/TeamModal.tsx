'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, X, Check, Trash2, Mail, Crown } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { TeamMemberItem } from '@/lib/types';
import { fetchApi } from '@/lib/api';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  members: TeamMemberItem[];
  onMemberAdded: (member: TeamMemberItem) => void;
  onMemberRemoved: (memberId: string) => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  documentId,
  members,
  onMemberAdded,
  onMemberRemoved,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Editor' | 'Viewer'>('Editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await fetchApi('/api/team/add', {
        method: 'POST',
        body: JSON.stringify({
          documentId,
          email,
          role,
        }),
      });

      onMemberAdded(data.member);
      setSuccess(`Invited ${email} as ${role}.`);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to add collaborator.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg p-6 rounded-2xl glass-panel bg-slate-900/90 border border-white/15 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Add People & Collaborators</h3>
              <p className="text-xs text-gray-400">
                Grant workspace access and assign roles for this document
              </p>
            </div>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleAddPerson} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Collaborator Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Workspace Permission Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Editor')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    role === 'Editor'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-sm">Editor</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Can edit tasks & timelines</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Viewer')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    role === 'Viewer'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-sm">Viewer</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Read-only access</div>
                </button>
              </div>
            </div>

            <GlassButton type="submit" isLoading={loading} className="w-full py-2.5 text-xs font-semibold gap-2">
              <UserPlus className="w-4 h-4" /> Send Workspace Invite
            </GlassButton>
          </form>

          {/* Feedback messages */}
          {error && <p className="text-xs text-red-400 mb-4 text-center">{error}</p>}
          {success && <p className="text-xs text-emerald-400 mb-4 text-center">{success}</p>}

          {/* Active Members List */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Current Collaborators ({members.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div
                  key={m._id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                      {m.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {m.userId?.name}
                        {m.role === 'Owner' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </p>
                      <p className="text-xs text-gray-400">{m.userId?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                      {m.role}
                    </span>
                    {m.role !== 'Owner' && (
                      <button
                        onClick={() => onMemberRemoved(m._id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
