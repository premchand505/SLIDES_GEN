'use client'; 

import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
// 1. Use a NORMAL import for DownloadButton
import { DownloadButton } from '@/components/DownloadButton';

/**
 * This component wraps the entire two-column app layout.
 */
export function MainAppLayout() {
  return (
    <main className="flex h-screen w-full overflow-hidden">
      
      {/* Column 1: Chat Interface */}
      <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">AI PPT Chat</h1>
        </header>
        <ChatInterface />
      </div>

      {/* Column 2: PPT Preview */}
      <div className="flex flex-col h-full flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Preview</h2>
          {/* This is now a simple static import */}
          <DownloadButton />
        </header>
        <PPTPreview />
      </div>

    </main>
  );
}