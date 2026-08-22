'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Plus, Calendar, User as UserIcon, AlertTriangle, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { TaskItem, TeamMemberItem } from '@/lib/types';

interface TaskKanbanProps {
  tasks: TaskItem[];
  teamMembers: TeamMemberItem[];
  onUpdateTaskStatus: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onCreateTask: (taskData: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  teamMembers,
  onUpdateTaskStatus,
  onCreateTask,
  onDeleteTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const priorityBadges = {
    High: 'bg-red-500/20 text-red-300 border-red-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onCreateTask({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedTo ? ({ id: assignedTo } as any) : undefined,
    });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const columns: Array<{ key: 'todo' | 'in_progress' | 'done'; title: string; color: string }> = [
    { key: 'todo', title: 'To-Do Items', color: 'border-cyan-500/30 text-cyan-400' },
    { key: 'in_progress', title: 'In Progress', color: 'border-amber-500/30 text-amber-400' },
    { key: 'done', title: 'Completed', color: 'border-emerald-500/30 text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Actionable To-Do Kanban & Checklist
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Categorized action items extracted by AI or added by your team
          </p>
        </div>
        <GlassButton
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs gap-2"
        >
          <Plus className="w-4 h-4" /> Add Action Item
        </GlassButton>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              {/* Column Header */}
              <div className={`p-3 rounded-xl bg-white/[0.03] border ${col.color} flex items-center justify-between`}>
                <span className="font-bold text-sm text-white">{col.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 min-h-[250px]">
                {colTasks.map((task) => (
                  <GlassCard
                    key={task._id}
                    className="p-4 relative group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() =>
                            onUpdateTaskStatus(
                              task._id,
                              task.status === 'done' ? 'todo' : 'done'
                            )
                          }
                          className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-colors"
                        >
                          {task.status === 'done' ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <h4
                            className={`text-sm font-semibold text-white ${
                              task.status === 'done' ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badges & Footer info */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                          priorityBadges[task.priority] || priorityBadges.Medium
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {task.dueDate}
                        </span>
                      )}

                      {task.assignedTo && (
                        <span className="flex items-center gap-1 text-cyan-300">
                          <UserIcon className="w-3.5 h-3.5" />
                          {task.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </GlassCard>
                ))}

                {colTasks.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
                    No items in {col.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl glass-panel bg-slate-900/90 border border-white/15 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Add Actionable To-Do Item</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Review legal compliance section"
                    className="w-full p-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details or action notes..."
                    className="w-full p-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl glass-input text-sm bg-slate-900"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                {teamMembers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                      Assign to Team Member
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-sm bg-slate-900"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((m) => {
                        const uid = m.userId._id || m.userId.id;
                        return (
                          <option key={uid} value={uid}>
                            {m.userId.name} ({m.role})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <GlassButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs"
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" className="px-5 py-2 text-xs">
                    Save Action Item
                  </GlassButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
