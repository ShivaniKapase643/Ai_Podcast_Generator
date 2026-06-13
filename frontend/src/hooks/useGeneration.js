import { useState, useCallback, useRef } from 'react';
import { triggerGeneration } from '../api/client.js';

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const eventSourceRef = useRef(null);

  const startGeneration = useCallback(() => {
    setIsGenerating(true);
    setProgress(0);
    setStage('');
    setMessage('Connecting...');
    setError(null);
    setResult(null);

    // Use the API base from env, fallback to /api for proxied setup
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${apiBase}/generate/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStage(data.stage);
        setProgress(data.progress);
        setMessage(data.message);

        if (data.stage === 'complete') {
          setResult(data.episode);
          setIsGenerating(false);
          eventSource.close();
        } else if (data.stage === 'error') {
          setError(data.message);
          setIsGenerating(false);
          eventSource.close();
        }
      } catch (e) {
        // Ignore heartbeat comments or parse errors
      }
    };

    eventSource.onerror = (e) => {
      // Only show error if we haven't received a completion
      if (eventSource.readyState === EventSource.CLOSED) return;
      // Don't immediately error — SSE can briefly disconnect
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.OPEN && isGenerating) {
          setError('Connection lost. The episode may still be generating in the background. Check Episodes tab.');
          setIsGenerating(false);
          eventSource.close();
        }
      }, 5000);
    };
  }, []);

  const cancelGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsGenerating(false);
    setMessage('Generation cancelled');
  }, []);

  const startDryRun = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setMessage('Running dry run (no audio)...');
    setProgress(50);
    setStage('scripting');

    try {
      const { data } = await triggerGeneration(true);
      setResult(data.episode);
      setProgress(100);
      setStage('complete');
      setMessage('Dry run complete!');
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || 'Dry run failed');
      setStage('error');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    progress,
    stage,
    message,
    error,
    result,
    startGeneration,
    cancelGeneration,
    startDryRun
  };
}
