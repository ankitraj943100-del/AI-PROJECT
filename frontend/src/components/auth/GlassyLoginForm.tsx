'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export const GlassyLoginForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, password } : { email, password };

      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full p-4 overflow-hidden bg-[#0a0f1d]">
      {/* Glowing Ambient Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Frosted Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Top Decorative Subtle Gradient Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500" />

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 backdrop-blur-md shadow-inner">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isRegister
              ? 'Join the AI PDF Task & Summary Orchestrator'
              : 'Sign in to access your AI document workspace'}
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Dynamic Login Button */}
          <GlassButton
            type="submit"
            isLoading={loading}
            className="w-full py-3.5 text-base font-semibold tracking-wide gap-2 group mt-2"
          >
            {isRegister ? 'Register & Launch Workspace' : 'Sign In to Workspace'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </GlassButton>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-sm text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-cyan-400 font-semibold hover:underline transition-all ml-1"
            >
              {isRegister ? 'Sign In' : 'Create One'}
            </button>
          </p>
        </div>

        {/* Security Badge Footnote */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted with JWT & bcrypt security</span>
        </div>
      </motion.div>
    </div>
  );
};
