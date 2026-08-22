import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: 'AI-Powered PDF Task & Summary Orchestrator',
  description: 'Upload PDF documents, extract summaries, actionable checklists, and deadlines with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0f1d] text-slate-100 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
