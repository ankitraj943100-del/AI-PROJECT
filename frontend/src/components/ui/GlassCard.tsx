'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  ...props
}) => {
  const glowStyles = {
    indigo: 'after:bg-indigo-500/10',
    cyan: 'after:bg-cyan-500/10',
    violet: 'after:bg-violet-500/10',
    emerald: 'after:bg-emerald-500/10',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative rounded-2xl glass-panel glass-panel-hover p-6 overflow-hidden ${
        glowColor !== 'none' ? `after:absolute after:inset-0 after:-z-10 after:blur-2xl ${glowStyles[glowColor]}` : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
