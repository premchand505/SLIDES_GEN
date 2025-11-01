import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview'; // <-- Import

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden">
      {/* Column 1: Chat Interface */}
      <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">AI PPT Chat</h1>
        </header>

        {/* This component is fully functional */}
        <ChatInterface />
        
      </div>

      {/* Column 2: PPT Preview */}
      <div className="flex flex-col h-full flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Preview</h2>
          {/* We will add a DownloadButton here in Phase 6 */}
        </header>
        
        {/* Replace the old placeholder div
          with our new functional preview component
        */}
        <PPTPreview />

      </div>
    </main>
  );
}