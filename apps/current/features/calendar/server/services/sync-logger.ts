export interface SyncLogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  operation: string
  provider: string
  userId: number
  eventId?: number
  message: string
  error?: Error
  metadata?: Record<string, any>
}

class SyncLogger {
  private logs: SyncLogEntry[] = []
  private maxLogs = 1000

  log(entry: Omit<SyncLogEntry, 'timestamp'>) {
    const logEntry: SyncLogEntry = {
      ...entry,
      timestamp: new Date(),
    }

    this.logs.push(logEntry)

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console logging for development
    const logMethod = entry.level === 'error' ? console.error :
                     entry.level === 'warn' ? console.warn : console.info

    logMethod(`[${entry.provider}] ${entry.operation}: ${entry.message}`, {
      userId: entry.userId,
      eventId: entry.eventId,
      metadata: entry.metadata,
      error: entry.error,
    })
  }

  info(operation: string, provider: string, userId: number, message: string, metadata?: Record<string, any>) {
    this.log({ level: 'info', operation, provider, userId, message, metadata })
  }

  warn(operation: string, provider: string, userId: number, message: string, metadata?: Record<string, any>) {
    this.log({ level: 'warn', operation, provider, userId, message, metadata })
  }

  error(operation: string, provider: string, userId: number, message: string, error?: Error, metadata?: Record<string, any>) {
    this.log({ level: 'error', operation, provider, userId, message, error, metadata })
  }

  getLogs(provider?: string, userId?: number, limit = 100): SyncLogEntry[] {
    let filteredLogs = this.logs

    if (provider) {
      filteredLogs = filteredLogs.filter(log => log.provider === provider)
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId)
    }

    return filteredLogs.slice(-limit)
  }

  clearLogs() {
    this.logs = []
  }
}

export const syncLogger = new SyncLogger()

