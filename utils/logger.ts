type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLog(level: LogLevel, msg: string, data?: unknown): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production
    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      msg,
    };
    if (data !== undefined) {
      payload.data = data;
    }
    return JSON.stringify(payload);
  }

  // Human-readable format for development
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`;
  if (data) {
    return `${prefix} ${msg} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${msg}`;
}

export const logger = {
  debug: (msg: string, data?: unknown) => {
    if (shouldLog('debug')) console.debug(formatLog('debug', msg, data));
  },
  info: (msg: string, data?: unknown) => {
    if (shouldLog('info')) console.info(formatLog('info', msg, data));
  },
  warn: (msg: string, data?: unknown) => {
    if (shouldLog('warn')) console.warn(formatLog('warn', msg, data));
  },
  error: (msg: string, data?: unknown) => {
    if (shouldLog('error')) console.error(formatLog('error', msg, data));
  },
};
