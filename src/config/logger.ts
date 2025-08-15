import { config } from '.';

// Simple logger utility for MVP
export function logInfo(message: string, ...args: any[]) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
}

export function logError(message: string, ...args: any[]) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
}

export function logDebug(message: string, ...args: any[]) {
  if (config.logLevel === 'debug') {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
  }
}
