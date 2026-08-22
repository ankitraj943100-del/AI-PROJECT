'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 backdrop-blur-md overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/35 border border-indigo-400/30',
    secondary:
      'bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-md shadow-black/20',
    danger:
      'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 shadow-md shadow-red-500/10',
    ghost:
      'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-transparent',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glow highlight orb */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />

      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          Processing...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
