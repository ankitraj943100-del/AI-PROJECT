'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, User, Send, X, Sparkles, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface FloatingAiAssistantProps {
  documentId?: string;
  documentTitle?: string;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  documentId,
  documentTitle = 'Current Document',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am your AI Document Assistant. Ask me anything about ${documentTitle}, request re-summaries, or ask for subtasks!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      if (!documentId) {
        throw new Error('Please select an active document to chat.');
      }

      const data = await fetchApi('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          documentId,
          message: userText,
          chatHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ ${err.message || 'Unable to connect to AI Assistant. Please verify document status.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.5)] border border-cyan-300/40 backdrop-blur-lg flex items-center gap-2.5 font-bold text-sm"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>AI Assistant</span>
        </motion.button>
      )}

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] rounded-3xl backdrop-blur-xl bg-slate-950/90 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900/50 via-slate-900 to-cyan-900/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AI PDF Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                    Context: {documentTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] text-gray-400 text-right mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-3 rounded-2xl w-fit">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Analyzing document context...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-900/60">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question about this PDF..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl glass-input text-xs"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
