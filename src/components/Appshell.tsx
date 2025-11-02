'use client';

import { ReactNode, useState } from 'react';
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-black relative">
      {/* Sidebar (visible on desktop, toggleable on mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 shadow-lg md:shadow-none"
          >
            <ChatHistorySidebar />

            {/* Close button visible only on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 md:hidden text-neutral-600 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9 text-black hover:bg-neutral-100"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? (
                <X className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Menu className="h-4 w-4 md:h-5 md:w-5" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h1 className="text-base md:text-xl font-semibold tracking-wide">
              SLIDES GEN
            </h1>
          </div>

          {/* Desktop spacing placeholder */}
          <div className="w-10 hidden md:block" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-white relative">
          {children}
        </div>
      </div>
    </div>
  );
}
