'use client';

import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ChatHistorySidebar() {
  const { sessions, currentSessionId, loadSession, deleteSession, createNewSession } = useChatStore();

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <Button 
          onClick={createNewSession}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No chat history yet
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors",
                  currentSessionId === session.id && "bg-muted"
                )}
                onClick={() => loadSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {session.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(session.updatedAt), 'MMM d, h:mm a')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}