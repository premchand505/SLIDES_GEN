'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { InitialPrompt } from '@/components/InitialPrompt';
import { toast } from 'sonner';
import { ChatMessage, ThinkingStep } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { ThinkingBubble } from '@/components/ThinkingBubble';

const STREAM_SEPARATOR = "\n<<<JSON_START>>>\n";

export function ChatInterface() {
  const { 
    pptData, 
    updatePPT, 
    messages: storeMessages, 
    addMessage,
  } = useChatStore();

  const [uiMessages, setUiMessages] = useState<ChatMessage[]>(storeMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingSteps, setStreamingSteps] = useState<ThinkingStep[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages, streamingSteps]);

  useEffect(() => {
    setUiMessages(storeMessages);
  }, [storeMessages]);

  /**
   * Extract all complete <thought> and <action> tags from text
   */
  const extractThoughtSteps = (text: string): ThinkingStep[] => {
    const steps: ThinkingStep[] = [];
    
    // Find all complete <thought>...</thought> tags
    const thoughtRegex = /<thought>([\s\S]*?)<\/thought>/g;
    let match;
    
    while ((match = thoughtRegex.exec(text)) !== null) {
      const content = match[1].trim();
      if (content) {
        steps.push({
          type: 'thought',
          content: content,
        });
      }
    }

    // Find all complete <action tool="...">...</action> tags
    const actionRegex = /<action\s+tool="(webSearch|readWebsite)">([\s\S]*?)<\/action>/g;
    
    while ((match = actionRegex.exec(text)) !== null) {
      const tool = match[1] as 'webSearch' | 'readWebsite';
      const content = match[2].trim();
      if (content) {
        steps.push({
          type: 'action',
          tool: tool,
          content: content,
        });
      }
    }

    // Sort steps by their position in the original text to maintain order
    steps.sort((a, b) => {
      const aIndex = text.indexOf(a.content);
      const bIndex = text.indexOf(b.content);
      return aIndex - bIndex;
    });

    // Check for incomplete tags (currently streaming)
    const lastThoughtStart = text.lastIndexOf('<thought>');
    const lastThoughtEnd = text.lastIndexOf('</thought>');
    const lastActionStart = text.lastIndexOf('<action');
    const lastActionEnd = text.lastIndexOf('</action>');
    
    // Check which tag is streaming (most recent unclosed tag)
    const streamingThought = lastThoughtStart > lastThoughtEnd;
    const streamingAction = lastActionStart > lastActionEnd;
    
    if (streamingThought && lastThoughtStart > lastActionStart) {
      const streamingContent = text.substring(lastThoughtStart + 9).trim();
      if (streamingContent && streamingContent.length > 0) {
        steps.push({
          type: 'thought',
          content: streamingContent,
          isStreaming: true,
        });
      }
    } else if (streamingAction && lastActionStart > lastThoughtStart) {
      // Extract tool type
      const toolMatch = text.substring(lastActionStart).match(/tool="(webSearch|readWebsite)"/);
      const tool = toolMatch ? (toolMatch[1] as 'webSearch' | 'readWebsite') : undefined;
      
      const actionStartTag = text.substring(lastActionStart).indexOf('>') + lastActionStart + 1;
      const streamingContent = text.substring(actionStartTag).trim();
      
      if (streamingContent && streamingContent.length > 0 && tool) {
        steps.push({
          type: 'action',
          tool: tool,
          content: streamingContent,
          isStreaming: true,
        });
      }
    }
    
    return steps;
  };

  const handleChatSubmit = async (input: string) => {
    setIsLoading(true);
    setStreamingSteps([]);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setUiMessages(prev => [...prev, userMessage]);

    let accumulatedText = "";
    let previousStepCount = 0;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          currentPPT: pptData,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      console.log('🔄 Starting stream...');

      // Stream processing
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Check if JSON part has started
        if (accumulatedText.includes(STREAM_SEPARATOR)) {
          // Clear streaming steps once we hit the JSON
          setStreamingSteps([]);
          break;
        }

        // Still in thinking phase - extract and update steps
        const currentSteps = extractThoughtSteps(accumulatedText);
        
        // Convert completed steps to messages
        const completedSteps = currentSteps.filter(step => !step.isStreaming);
        
        // If we have new completed steps, save them as messages
        if (completedSteps.length > previousStepCount) {
          const newSteps = completedSteps.slice(previousStepCount);
          
          newSteps.forEach(step => {
            const thinkingMessage: ChatMessage = {
              id: uuidv4(),
              role: 'model',
              content: step.content,
              timestamp: new Date(),
              thinkingStep: step,
            };
            addMessage(thinkingMessage);
            setUiMessages(prev => [...prev, thinkingMessage]);
          });
          
          previousStepCount = completedSteps.length;
        }
        
        // Show only the currently streaming step (if any)
        const streamingStep = currentSteps.find(step => step.isStreaming);
        setStreamingSteps(streamingStep ? [streamingStep] : []);
      }

      console.log('✅ Stream complete');
      setStreamingSteps([]);

      // Continue reading to get the JSON part
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });
      }

      // Extract and parse JSON
      if (!accumulatedText.includes(STREAM_SEPARATOR)) {
        throw new Error("Invalid response format - no JSON separator found");
      }

      const parts = accumulatedText.split(STREAM_SEPARATOR);
      const jsonText = parts[parts.length - 1]?.trim();

      if (!jsonText) {
        throw new Error("No JSON data received");
      }

      console.log('📦 Parsing JSON...');
      const doneData = JSON.parse(jsonText);
      
      if (doneData.type === 'done' && doneData.data) {
        const slideCount = doneData.data.slides?.length || 0;
        console.log('✅ Generated', slideCount, 'slides');
        
        const finalMessage: ChatMessage = {
          id: uuidv4(),
          role: 'model',
          content: `✓ Generated ${slideCount} slide${slideCount !== 1 ? 's' : ''}`,
          timestamp: new Date(),
        };
        addMessage(finalMessage);
        setUiMessages(prev => [...prev, finalMessage]);
        updatePPT(doneData.data);
        
        toast.success(`${slideCount} slides created!`);
        
      } else if (doneData.type === 'error') {
        throw new Error(doneData.error || 'Unknown error from API');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("❌ Error:", message);
      toast.error(message);
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: `Error: ${message}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      setUiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingSteps([]);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {uiMessages.length === 0 ? (
        <motion.div
          key="initial"
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <InitialPrompt
            onSubmit={handleChatSubmit}
            isLoading={isLoading}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="chat"
          className="flex flex-col h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {uiMessages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg}
              />
            ))}
            
            <AnimatePresence>
              {streamingSteps.map((step, index) => (
                <ThinkingBubble 
                  key={`streaming-${index}`} 
                  step={step} 
                />
              ))}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}