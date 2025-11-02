'use client';

import { ReactNode, useState } from 'react';
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* DESKTOP SIDEBAR - Hidden on mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block fixed md:relative inset-y-0 left-0 z-50 w-64 bg-background border-r"
          >
            <ChatHistorySidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MOBILE SIDEBAR - Sheet drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 md:hidden">
          <ChatHistorySidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border-b bg-background">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h1 className="text-base md:text-xl font-semibold">SLIDES GEN</h1>
          </div>
          
          {/* Desktop spacing */}
          <div className="w-10 hidden md:block" />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}