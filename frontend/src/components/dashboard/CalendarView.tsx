'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, ArrowUpRight, Flame } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Deadline } from '@/lib/types';

interface CalendarViewProps {
  deadlines?: Deadline[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ deadlines = [] }) => {
  const priorityStyles = {
    High: 'bg-red-500/20 text-red-300 border-red-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            Extracted Deadlines & Timelines
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Inferred target dates, project milestones, and critical deadlines
          </p>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Clock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No explicit deadlines extracted from this document.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deadlines.map((dl, index) => (
            <GlassCard key={index} glowColor={dl.priority === 'High' ? 'cyan' : 'none'}>
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2 ${
                      priorityStyles[dl.priority] || priorityStyles.Medium
                    }`}
                  >
                    {dl.priority} Priority
                  </span>
                  <h4 className="text-base font-bold text-white mb-1">{dl.title}</h4>
                  {dl.description && (
                    <p className="text-xs text-gray-300 leading-relaxed">{dl.description}</p>
                  )}
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {dl.date}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
