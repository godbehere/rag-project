// Simple logger utility for MVP
export function logInfo(message: string, ...args: any[]) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
}

export function logError(message: string, ...args: any[]) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
}
