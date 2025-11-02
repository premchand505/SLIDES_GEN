'use client';

import { useChatStore } from '@/store/useChatStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export function ChatHistorySidebar() {
  const {
    sessions,
    currentSessionId,
    loadSession,
    deleteSession,
    createNewSession,
  } = useChatStore();

  return (
    <div className="w-64 border-r border-neutral-200 bg-white text-black flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <Button
          onClick={createNewSession}
          className="w-full bg-black text-white hover:bg-neutral-800 transition-colors"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Scrollable Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-sm text-neutral-500 p-4">
              No chat history yet
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group relative flex items-center gap-2 rounded-lg p-3 cursor-pointer transition-colors',
                  currentSessionId === session.id
                    ? 'bg-neutral-100'
                    : 'hover:bg-neutral-50'
                )}
                onClick={() => loadSession(session.id)}
              >
                {/* Message Icon */}
                <MessageSquare
                  className={cn(
                    'h-4 w-4 shrink-0',
                    currentSessionId === session.id
                      ? 'text-black'
                      : 'text-neutral-600'
                  )}
                />

                {/* Title + Date */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm font-medium truncate',
                      currentSessionId === session.id
                        ? 'text-black'
                        : 'text-neutral-700'
                    )}
                  >
                    {session.title}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {format(new Date(session.updatedAt), 'MMM d, h:mm a')}
                  </div>
                </div>

                {/* Trash Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="h-6 w-6 flex items-center justify-center rounded 
                    text-neutral-500 hover:text-black hover:bg-neutral-100 
                    md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
