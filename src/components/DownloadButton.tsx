// src/components/DownloadButton.tsx
'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessResponse {
  base64: string;
}
interface ErrorResponse {
  error: string;
}
type ApiResponse = SuccessResponse | ErrorResponse;

function triggerDownload(base64: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { pptData } = useChatStore();

  const handleDownload = async () => {
    if (!pptData?.slides?.length) {
      toast.error('No presentation to download.');
      return;
    }

    setIsDownloading(true);

    try {
      const res = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pptData),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !('base64' in data)) {
        throw new Error((data as ErrorResponse).error ?? 'Failed to generate PPTX');
      }

      const fileName = `presentation-${new Date().toISOString().split('T')[0]}.pptx`;
      triggerDownload(data.base64, fileName);
      toast.success('PPTX downloaded successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Download failed:', err);
      toast.error('Download failed', { description: message });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!pptData?.slides?.length) return null;

  return (
    <Button onClick={handleDownload} disabled={isDownloading} size="sm">
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PPTX
        </>
      )}
    </Button>
  );
}