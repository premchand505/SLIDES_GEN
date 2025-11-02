// components/AppShell.tsx
'use client';

import { ReactNode, useState } from 'react';
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r md:relative"
          >
            <ChatHistorySidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="shrink-0 flex items-center justify-between p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-semibold">AI PPT Chat</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}