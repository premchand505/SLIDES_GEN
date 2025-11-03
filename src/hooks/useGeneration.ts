// hooks/useGeneration.ts
'use client';

import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, ThinkingStep } from '@/types';

const STREAM_SEPARATOR = '<<<JSON_START>>>';

function extractThoughtSteps(text: string): ThinkingStep[] {
  const steps: ThinkingStep[] = [];
  const thoughtRegex = /<thought\s+type="([^"]+)"(?:\s+tool="([^"]+)")?\s*>([\s\S]*?)<\/thought>/g;
  let match;

  while ((match = thoughtRegex.exec(text)) !== null) {
    steps.push({
      type: match[1] as 'thought' | 'action',
      tool: match[2] as 'webSearch' | 'readWebsite' | undefined,
      content: match[3].trim(),
      isStreaming: false,
    });
  }

  // Handle incomplete last thought
  const lastThoughtStart = text.lastIndexOf('<thought');
  if (lastThoughtStart !== -1 && text.lastIndexOf('</thought>') < lastThoughtStart) {
    const streamingContent = text.substring(lastThoughtStart).replace(/<thought[^>]*>/, '').trim();
    if (streamingContent) {
      const typeMatch = text.substring(lastThoughtStart).match(/type="(thought|action)"/);
      const toolMatch = text.substring(lastThoughtStart).match(/tool="(webSearch|readWebsite)"/);
      
      steps.push({
        type: (typeMatch?.[1] as 'thought' | 'action') || 'thought',
        tool: toolMatch?.[1] as 'webSearch' | 'readWebsite' | undefined,
        content: streamingContent,
        isStreaming: true,
      });
    }
  }
  
  return steps;
}

function convertStepsToMessages(steps: ThinkingStep[]): ChatMessage[] {
  return steps
    .filter(step => step.content.length > 0)
    .map(step => ({
      id: uuidv4(),
      role: 'model' as const,
      content: step.content,
      timestamp: new Date(),
      thinkingStep: step,
    }));
}

export function useGeneration() {
  const { pptData, updatePPT, addMessage } = useChatStore();

  const handleGenerate = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    useChatStore.setState({ isLoading: true });

    let accumulatedText = "";
    const finalThinkingSteps: ThinkingStep[] = [];  // now const + push
    let jsonStarted = false;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: trimmedInput,
          currentPPT: pptData,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      console.log('Starting stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        const currentSteps = extractThoughtSteps(accumulatedText);
        const completeSteps = currentSteps.filter(s => !s.isStreaming);

        const existingContents = finalThinkingSteps.map(s => s.content);
        const newSteps = completeSteps.filter(s => !existingContents.includes(s.content));

        if (newSteps.length > 0) {
          const messages = convertStepsToMessages(newSteps);
          messages.forEach(addMessage);
          finalThinkingSteps.push(...newSteps);  // mutate array
        }

        if (accumulatedText.includes(STREAM_SEPARATOR) && !jsonStarted) {
          jsonStarted = true;
          console.log('JSON separator found');
        }
      }

      console.log('Stream complete');

      let jsonText = "";
      if (accumulatedText.includes(STREAM_SEPARATOR)) {
        const parts = accumulatedText.split(STREAM_SEPARATOR);
        jsonText = parts[parts.length - 1]?.trim() || '';
      } else {
        const jsonMatch = accumulatedText.match(/\{[\s\S]*"type"\s*:\s*"done"[\s\S]*\}/);
        if (jsonMatch) jsonText = jsonMatch[0];
      }

      if (!jsonText) throw new Error("No JSON data found");

      const doneData = JSON.parse(jsonText);
      
      if (doneData.type === 'done' && doneData.data) {
        const slideCount = doneData.data.slides?.length || 0;
        console.log('Generated', slideCount, 'slides');
        
        const finalMessage: ChatMessage = {
          id: uuidv4(),
          role: 'model',
          content: `Successfully generated ${slideCount} slide${slideCount !== 1 ? 's' : ''} with rich content`,
          timestamp: new Date(),
        };
        addMessage(finalMessage);
        updatePPT(doneData.data);
        
        toast.success(`${slideCount} slides created!`, {
          description: 'Your presentation is ready',
        });
        
      } else if (doneData.type === 'error') {
        throw new Error(doneData.error || 'Unknown error from API');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error:", message);
      toast.error('Generation failed', { description: message });
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: `Error: ${message}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      useChatStore.setState({ isLoading: false });
    }
  };

  return { handleGenerate };
}