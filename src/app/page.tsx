import { ChatInterface } from '@/components/ChatInterface'; // <-- Import

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden">
      {/* Column 1: Chat Interface */}
      <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">AI PPT Chat</h1>
          {/* We can add a "New Chat" button here later */}
        </header>

        {/* Replace the old placeholder divs
          with our new single component
        */}
        <ChatInterface />
        
      </div>

      {/* Column 2: PPT Preview */}
      <div className="flex flex-col h-full flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Preview</h2>
          {/* Placeholder for Download/Edit buttons */}
        </header>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              PPT Preview will appear here...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}