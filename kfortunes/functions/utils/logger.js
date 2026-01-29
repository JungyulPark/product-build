/**
 * Logger Utility for Cloudflare Workers
 * 에러 모니터링 및 로깅 유틸리티
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Configuration
const CONFIG = {
  // Minimum log level to output
  minLevel: LOG_LEVELS.INFO,

  // Include additional context
  includeTimestamp: true,
  includeRequestId: true,

  // Service name for identification
  serviceName: 'kfortunes-api',

  // Environment (set via env variable)
  environment: 'production'
};

/**
 * Generate a unique request ID
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format log entry as structured JSON
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 * @returns {Object} - Formatted log entry
 */
function formatLogEntry(level, message, context = {}) {
  const entry = {
    level,
    message,
    service: CONFIG.serviceName,
    environment: CONFIG.environment
  };

  if (CONFIG.includeTimestamp) {
    entry.timestamp = new Date().toISOString();
  }

  if (context.requestId && CONFIG.includeRequestId) {
    entry.requestId = context.requestId;
  }

  // Add additional context
  if (Object.keys(context).length > 0) {
    entry.context = {};
    for (const [key, value] of Object.entries(context)) {
      if (key !== 'requestId') {
        entry.context[key] = value;
      }
    }
    if (Object.keys(entry.context).length === 0) {
      delete entry.context;
    }
  }

  return entry;
}

/**
 * Output log entry
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function log(level, message, context = {}) {
  // Use nullish coalescing to handle 0 (DEBUG level) correctly
  const levelValue = LOG_LEVELS[level] ?? LOG_LEVELS.INFO;

  if (levelValue < CONFIG.minLevel) {
    return;
  }

  const entry = formatLogEntry(level, message, context);
  const jsonEntry = JSON.stringify(entry);

  switch (level) {
    case 'DEBUG':
    case 'INFO':
      console.log(jsonEntry);
      break;
    case 'WARN':
      console.warn(jsonEntry);
      break;
    case 'ERROR':
    case 'FATAL':
      console.error(jsonEntry);
      break;
    default:
      console.log(jsonEntry);
  }
}

/**
 * Log debug message
 */
function debug(message, context = {}) {
  log('DEBUG', message, context);
}

/**
 * Log info message
 */
function info(message, context = {}) {
  log('INFO', message, context);
}

/**
 * Log warning message
 */
function warn(message, context = {}) {
  log('WARN', message, context);
}

/**
 * Log error message with stack trace
 * @param {string} message - Error message
 * @param {Error|Object} errorOrContext - Error object or context
 * @param {Object} additionalContext - Additional context if error provided
 */
function error(message, errorOrContext = {}, additionalContext = {}) {
  let context = additionalContext;

  if (errorOrContext instanceof Error) {
    context = {
      ...additionalContext,
      error: {
        name: errorOrContext.name,
        message: errorOrContext.message,
        stack: errorOrContext.stack,
        code: errorOrContext.code
      }
    };
  } else {
    context = { ...errorOrContext, ...additionalContext };
  }

  log('ERROR', message, context);
}

/**
 * Log fatal error (critical system failure)
 */
function fatal(message, errorOrContext = {}, additionalContext = {}) {
  let context = additionalContext;

  if (errorOrContext instanceof Error) {
    context = {
      ...additionalContext,
      error: {
        name: errorOrContext.name,
        message: errorOrContext.message,
        stack: errorOrContext.stack,
        code: errorOrContext.code
      }
    };
  } else {
    context = { ...errorOrContext, ...additionalContext };
  }

  log('FATAL', message, context);
}

/**
 * Create a request-scoped logger
 * @param {Request} request - The incoming request
 * @returns {Object} - Logger instance with request context
 */
function createRequestLogger(request) {
  const requestId = request.headers?.get('CF-Ray') ||
                    request.headers?.get('X-Request-ID') ||
                    generateRequestId();

  const baseContext = {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers?.get('User-Agent'),
    ip: request.headers?.get('CF-Connecting-IP') ||
        request.headers?.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        'unknown'
  };

  return {
    requestId,
    debug: (msg, ctx = {}) => debug(msg, { ...baseContext, ...ctx }),
    info: (msg, ctx = {}) => info(msg, { ...baseContext, ...ctx }),
    warn: (msg, ctx = {}) => warn(msg, { ...baseContext, ...ctx }),
    error: (msg, err, ctx = {}) => error(msg, err, { ...baseContext, ...ctx }),
    fatal: (msg, err, ctx = {}) => fatal(msg, err, { ...baseContext, ...ctx }),

    // Log request start
    logRequest: () => {
      info('Request received', baseContext);
    },

    // Log request completion
    logResponse: (statusCode, duration) => {
      info('Request completed', {
        ...baseContext,
        statusCode,
        duration: `${duration}ms`
      });
    },

    // Log API call
    logApiCall: (api, success, duration, details = {}) => {
      const level = success ? 'info' : 'warn';
      log(level.toUpperCase(), `External API call: ${api}`, {
        ...baseContext,
        api,
        success,
        duration: `${duration}ms`,
        ...details
      });
    }
  };
}

/**
 * Error tracker for aggregating errors
 */
const errorTracker = {
  errors: [],
  maxErrors: 100,

  /**
   * Track an error occurrence
   * @param {string} errorType - Type of error
   * @param {Object} details - Error details
   */
  track(errorType, details = {}) {
    const entry = {
      type: errorType,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.errors.push(entry);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  },

  /**
   * Get error statistics
   * @returns {Object} - Error statistics
   */
  getStats() {
    const stats = {};
    for (const err of this.errors) {
      stats[err.type] = (stats[err.type] || 0) + 1;
    }
    return {
      total: this.errors.length,
      byType: stats,
      recent: this.errors.slice(-5)
    };
  },

  /**
   * Clear tracked errors
   */
  clear() {
    this.errors = [];
  }
};

/**
 * Performance monitor for tracking API latency
 */
const performanceMonitor = {
  metrics: {},

  /**
   * Record a metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value (usually duration in ms)
   */
  record(name, value) {
    if (!this.metrics[name]) {
      this.metrics[name] = {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity
      };
    }

    const metric = this.metrics[name];
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
  },

  /**
   * Get metric summary
   * @param {string} name - Metric name
   * @returns {Object} - Metric summary
   */
  getSummary(name) {
    const metric = this.metrics[name];
    if (!metric) return null;

    return {
      count: metric.count,
      avg: Math.round(metric.total / metric.count),
      min: metric.min,
      max: metric.max
    };
  },

  /**
   * Get all metrics
   * @returns {Object} - All metrics summary
   */
  getAllSummaries() {
    const summaries = {};
    for (const name of Object.keys(this.metrics)) {
      summaries[name] = this.getSummary(name);
    }
    return summaries;
  },

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = {};
  }
};

/**
 * Middleware for logging requests in Cloudflare Pages Functions
 * @param {Object} context - Cloudflare Pages Function context
 * @param {Function} next - Next handler
 * @returns {Response} - Response with logging
 */
async function loggingMiddleware(context, next) {
  const logger = createRequestLogger(context.request);
  const startTime = Date.now();

  // Attach logger to context
  context.logger = logger;
  logger.logRequest();

  try {
    const response = await next();
    const duration = Date.now() - startTime;

    logger.logResponse(response.status, duration);
    performanceMonitor.record('request_duration', duration);

    return response;
  } catch (err) {
    const duration = Date.now() - startTime;

    logger.error('Request failed', err, { duration: `${duration}ms` });
    errorTracker.track('REQUEST_ERROR', {
      message: err.message,
      url: context.request.url
    });

    throw err;
  }
}

// Export for use in Cloudflare Pages Functions
module.exports = {
  LOG_LEVELS,
  CONFIG,
  generateRequestId,
  formatLogEntry,
  log,
  debug,
  info,
  warn,
  error,
  fatal,
  createRequestLogger,
  errorTracker,
  performanceMonitor,
  loggingMiddleware
};
