import { useState, useCallback, useRef, useEffect } from 'react';
import { triggerGeneration } from '../api/client.js';

// Global state so generation persists across tab switches
let globalState = {
  isGenerating: false,
  progress: 0,
  stage: '',
  message: '',
  error: null,
  result: null
};

let listeners = new Set();
let activeEventSource = null;

function notify() {
  listeners.forEach(fn => fn({ ...globalState }));
}

function updateGlobal(updates) {
  globalState = { ...globalState, ...updates };
  notify();
}

export function useGeneration() {
  const [state, setState] = useState({ ...globalState });

  useEffect(() => {
    const listener = (newState) => setState(newState);
    listeners.add(listener);
    // Sync with current global state immediately
    setState({ ...globalState });
    return () => listeners.delete(listener);
  }, []);

  const startGeneration = useCallback(() => {
    // Don't start if already generating
    if (globalState.isGenerating) return;

    updateGlobal({ isGenerating: true, progress: 0, stage: '', message: 'Connecting...', error: null, result: null });

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${apiBase}/generate/stream`;
    
    // Close any existing connection
    if (activeEventSource) activeEventSource.close();

    const eventSource = new EventSource(url);
    activeEventSource = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updateGlobal({ stage: data.stage, progress: data.progress, message: data.message });

        if (data.stage === 'complete') {
          updateGlobal({ result: data.episode, isGenerating: false });
          eventSource.close();
          activeEventSource = null;
        } else if (data.stage === 'error') {
          updateGlobal({ error: data.message, isGenerating: false });
          eventSource.close();
          activeEventSource = null;
        }
      } catch (e) {
        // Ignore parse errors (heartbeats)
      }
    };

    eventSource.onerror = () => {
      // Wait before showing error — may reconnect
      setTimeout(() => {
        if (activeEventSource === eventSource && eventSource.readyState === EventSource.CLOSED) {
          updateGlobal({ 
            error: 'Connection lost. Episode may still be generating in background — check Episodes tab in a minute.',
            isGenerating: false 
          });
          activeEventSource = null;
        }
      }, 8000);
    };
  }, []);

  const cancelGeneration = useCallback(() => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    updateGlobal({ isGenerating: false, message: 'Cancelled' });
  }, []);

  const startDryRun = useCallback(async () => {
    if (globalState.isGenerating) return;
    updateGlobal({ isGenerating: true, error: null, result: null, message: 'Running dry run...', progress: 50, stage: 'scripting' });

    try {
      const { data } = await triggerGeneration(true);
      updateGlobal({ result: data.episode, progress: 100, stage: 'complete', message: 'Dry run complete!', isGenerating: false });
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.details || (typeof errData?.error === 'string' ? errData.error : errData?.error?.message) || 'Dry run failed';
      updateGlobal({ error: msg, stage: 'error', isGenerating: false });
    }
  }, []);

  const clearResult = useCallback(() => {
    updateGlobal({ result: null, error: null });
  }, []);

  return {
    isGenerating: state.isGenerating,
    progress: state.progress,
    stage: state.stage,
    message: state.message,
    error: state.error,
    result: state.result,
    startGeneration,
    cancelGeneration,
    startDryRun,
    clearResult
  };
}
