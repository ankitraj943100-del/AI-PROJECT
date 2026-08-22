'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, FileText, Bookmark } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Summary } from '@/lib/types';

interface ExecutiveSummaryProps {
  summary?: Summary;
  documentTitle: string;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  documentTitle,
}) => {
  if (!summary) {
    return (
      <GlassCard className="text-center py-12">
        <Sparkles className="w-8 h-8 text-gray-500 mx-auto mb-3 animate-spin" />
        <p className="text-gray-400 text-sm">Generating AI Executive Summary...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <GlassCard glowColor="cyan" className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Document Overview</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{summary.overview}</p>
      </GlassCard>

      {/* Key Highlights */}
      <GlassCard glowColor="indigo">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Key Highlights & Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.keyHighlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-200">{highlight}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Executive Brief */}
      <GlassCard glowColor="violet">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Executive Brief</h3>
        </div>
        <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-gray-300 text-sm leading-relaxed">
          {summary.executiveBrief}
        </div>
      </GlassCard>
    </div>
  );
};
