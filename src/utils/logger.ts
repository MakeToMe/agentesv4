/**
 * Utility for conditional logging based on environment and authentication state
 */

// Check if we're in development mode
const isDev = import.meta.env.DEV;

/**
 * Logger utility that only logs in development mode and when the user is authenticated
 * @param isAuthenticated - Whether the user is authenticated
 * @returns A logger object with log, error, warn, and info methods
 */
export const createLogger = (isAuthenticated: boolean) => {
  // Only log in development mode and when authenticated
  const shouldLog = isDev && isAuthenticated;

  return {
    /**
     * Log a message to the console (only in development and when authenticated)
     */
    log: (...args: any[]) => {
      if (shouldLog) {
        console.log(...args);
      }
    },

    /**
     * Log an error to the console (only in development and when authenticated)
     */
    error: (...args: any[]) => {
      if (shouldLog) {
        console.error(...args);
      }
    },

    /**
     * Log a warning to the console (only in development and when authenticated)
     */
    warn: (...args: any[]) => {
      if (shouldLog) {
        console.warn(...args);
      }
    },

    /**
     * Log info to the console (only in development and when authenticated)
     */
    info: (...args: any[]) => {
      if (shouldLog) {
        console.info(...args);
      }
    }
  };
};

/**
 * Create a logger that always logs regardless of authentication state
 * Use this only for critical errors that should always be logged
 */
export const createCriticalLogger = () => {
  // Only log in development mode
  const shouldLog = isDev;

  return {
    log: (...args: any[]) => {
      if (shouldLog) {
        console.log(...args);
      }
    },
    error: (...args: any[]) => {
      if (shouldLog) {
        console.error(...args);
      }
    },
    warn: (...args: any[]) => {
      if (shouldLog) {
        console.warn(...args);
      }
    },
    info: (...args: any[]) => {
      if (shouldLog) {
        console.info(...args);
      }
    }
  };
};
