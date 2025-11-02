import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';
import { ChatMessage, ThinkingStep } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STREAM_SEPARATOR = "\n<<<JSON_START>>>\n";

/**
 * Extract all complete <thought> tags from text
 */
function extractThoughtSteps(text: string): ThinkingStep[] {
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

  // Check for incomplete thought (currently streaming)
  const lastThoughtStart = text.lastIndexOf('<thought>');
  const lastThoughtEnd = text.lastIndexOf('</thought>');
  
  if (lastThoughtStart > lastThoughtEnd && lastThoughtStart !== -1) {
    const streamingContent = text.substring(lastThoughtStart + 9).trim();
    if (streamingContent && streamingContent.length > 0) {
      steps.push({
        type: 'thought',
        content: streamingContent,
        isStreaming: true,
      });
    }
  }
  
  return steps;
}

function convertStepsToMessages(steps: ThinkingStep[]): ChatMessage[] {
  return steps
    .filter(step => !step.isStreaming && step.content.length > 0)
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

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Set loading state
    useChatStore.setState({ isLoading: true });

    let accumulatedText = "";
    let finalThinkingSteps: ThinkingStep[] = [];
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

      console.log('🔄 Starting stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Check if JSON part has started
        if (accumulatedText.includes(STREAM_SEPARATOR) && !jsonStarted) {
          jsonStarted = true;
          console.log('📍 JSON separator found');
          
          // Extract thinking part (before separator)
          const thinkingPart = accumulatedText.split(STREAM_SEPARATOR)[0];
          finalThinkingSteps = extractThoughtSteps(thinkingPart);
        }
      }

      console.log('✅ Stream complete');

      // If no separator found, check if we have thinking tags anyway
      if (!jsonStarted && accumulatedText.includes('<thought>')) {
        console.log('⚠️ Found thinking tags but no separator, extracting anyway...');
        const lastThoughtEnd = accumulatedText.lastIndexOf('</thought>');
        if (lastThoughtEnd !== -1) {
          const thinkingPart = accumulatedText.substring(0, lastThoughtEnd + 10);
          finalThinkingSteps = extractThoughtSteps(thinkingPart);
        }
      }

      // Convert thinking steps to permanent messages
      if (finalThinkingSteps.length > 0) {
        const thinkingMessages = convertStepsToMessages(finalThinkingSteps);
        thinkingMessages.forEach(msg => addMessage(msg));
      }

      // Extract and parse JSON
      let jsonText = "";
      
      if (accumulatedText.includes(STREAM_SEPARATOR)) {
        const parts = accumulatedText.split(STREAM_SEPARATOR);
        jsonText = parts[parts.length - 1]?.trim();
      } else {
        // Try to find JSON without separator
        const jsonMatch = accumulatedText.match(/\{[\s\S]*"type"\s*:\s*"done"[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      if (!jsonText) {
        throw new Error("No JSON data found in response");
      }

      console.log('📦 Parsing JSON, length:', jsonText.length);
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
    } finally {
      useChatStore.setState({ isLoading: false });
    }
  };

  return { handleGenerate };
}