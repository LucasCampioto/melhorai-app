/**
 * Helper function for debug logging to external API
 * Only logs if VITE_DEBUG_API_URL is set in environment variables
 */
export function debugLog(data: {
  location: string;
  message: string;
  data?: any;
  timestamp?: number;
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
}) {
  const debugApiUrl = import.meta.env.VITE_DEBUG_API_URL;
  
  // Only log if the URL is configured
  if (!debugApiUrl) {
    return;
  }

  const payload = {
    ...data,
    timestamp: data.timestamp || Date.now(),
    sessionId: data.sessionId || 'debug-session',
  };

  // Fire and forget - don't block execution
  fetch(debugApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently fail - debug logging should never break the app
  });
}
