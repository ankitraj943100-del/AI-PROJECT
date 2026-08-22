'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { fetchApi, getAuthToken } from '@/lib/api';

interface DocUploaderProps {
  onUploadSuccess: (document: any) => void;
}

export const DocUploader: React.FC<DocUploaderProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError('');
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Only PDF documents are allowed.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document.');
      }

      setProgress(100);
      onUploadSuccess(data.document);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard glowColor="indigo" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">AI Document Ingestion</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
          PDF Parsing Pipeline
        </span>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-base font-medium text-white mb-1">
            Drag & Drop your PDF here, or <span className="text-cyan-400 underline">Browse</span>
          </p>
          <p className="text-xs text-gray-400">Maximum file size: 20MB (.pdf format only)</p>
        </div>
      </div>

      {/* File Selected Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                isLoading={uploading}
                className="px-4 py-2 text-xs font-semibold"
              >
                Upload & Process
              </GlassButton>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </GlassCard>
  );
};
