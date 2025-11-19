/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LOG_STORAGE_KEY = 'planka_debug_logs';
const MAX_LOGS = 1000;

const getLogs = () => {
  try {
    const logsJson = localStorage.getItem(LOG_STORAGE_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs) => {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Ignore storage errors
  }
};

// Check if we're in development mode
const isDev = import.meta.env.DEV;

export const log = (prefix, ...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map((arg) => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  const logEntry = {
    timestamp,
    prefix,
    message,
    args: args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return arg;
    }),
  };

  // Save to localStorage only in dev mode
  if (isDev) {
    const logs = getLogs();
    logs.push(logEntry);
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }
    saveLogs(logs);
  }

  // Log to console only in dev mode
  if (isDev) {
    console.log(`[${prefix}]`, ...args);
  }
};

export const getStoredLogs = () => {
  return getLogs();
};

export const clearStoredLogs = () => {
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const downloadLogs = () => {
  const logs = getLogs();
  const logsText = logs.map((log) =>
    `[${log.timestamp}] [${log.prefix}] ${log.message}`
  ).join('\n');

  const blob = new Blob([logsText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planka-logs-${new Date().toISOString()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.plankaDebug = {
    getLogs: getStoredLogs,
    clearLogs: clearStoredLogs,
    downloadLogs,
  };
}
