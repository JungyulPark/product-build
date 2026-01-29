/**
 * Logger Utility Unit Tests
 * 로깅 유틸리티 단위 테스트
 */

const path = require('path');
const logger = require(path.join(__dirname, '../functions/utils/logger.js'));

describe('Logger Utility', () => {

  // Suppress console output during tests
  let consoleLogSpy, consoleWarnSpy, consoleErrorSpy;
  let originalMinLevel;

  beforeEach(() => {
    // Create fresh spies for each test
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clear all mock calls
    consoleLogSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();

    // Save and reset minLevel
    originalMinLevel = logger.CONFIG.minLevel;
    logger.CONFIG.minLevel = logger.LOG_LEVELS.INFO;

    // Clear trackers
    logger.errorTracker.clear();
    logger.performanceMonitor.clear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // Restore original minLevel
    logger.CONFIG.minLevel = originalMinLevel;
  });

  describe('LOG_LEVELS', () => {
    test('should have correct log level values', () => {
      expect(logger.LOG_LEVELS.DEBUG).toBe(0);
      expect(logger.LOG_LEVELS.INFO).toBe(1);
      expect(logger.LOG_LEVELS.WARN).toBe(2);
      expect(logger.LOG_LEVELS.ERROR).toBe(3);
      expect(logger.LOG_LEVELS.FATAL).toBe(4);
    });
  });

  describe('CONFIG', () => {
    test('should have default configuration', () => {
      expect(logger.CONFIG.serviceName).toBe('kfortunes-api');
      expect(logger.CONFIG.includeTimestamp).toBe(true);
      expect(logger.CONFIG.includeRequestId).toBe(true);
    });
  });

  describe('generateRequestId()', () => {
    test('should generate unique IDs', () => {
      const id1 = logger.generateRequestId();
      const id2 = logger.generateRequestId();

      expect(id1).not.toBe(id2);
    });

    test('should generate string IDs', () => {
      const id = logger.generateRequestId();
      expect(typeof id).toBe('string');
    });

    test('should contain hyphen separator', () => {
      const id = logger.generateRequestId();
      expect(id).toContain('-');
    });
  });

  describe('formatLogEntry()', () => {
    test('should include basic fields', () => {
      const entry = logger.formatLogEntry('INFO', 'Test message');

      expect(entry.level).toBe('INFO');
      expect(entry.message).toBe('Test message');
      expect(entry.service).toBe('kfortunes-api');
    });

    test('should include timestamp when configured', () => {
      const entry = logger.formatLogEntry('INFO', 'Test');
      expect(entry.timestamp).toBeDefined();
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('should include request ID from context', () => {
      const entry = logger.formatLogEntry('INFO', 'Test', { requestId: 'abc123' });
      expect(entry.requestId).toBe('abc123');
    });

    test('should include additional context', () => {
      const entry = logger.formatLogEntry('INFO', 'Test', {
        userId: '12345',
        action: 'login'
      });

      expect(entry.context.userId).toBe('12345');
      expect(entry.context.action).toBe('login');
    });
  });

  describe('log()', () => {
    test('should call console.log for INFO level', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    test('should call console.warn for WARN level', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test('should call console.error for ERROR level', () => {
      logger.error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should output valid JSON', () => {
      logger.info('Test message');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(() => JSON.parse(call)).not.toThrow();
    });
  });

  describe('debug()', () => {
    test('should not output when minLevel is higher than DEBUG', () => {
      // Explicitly set minLevel to INFO (which is higher than DEBUG)
      logger.CONFIG.minLevel = 1; // INFO level
      const callCountBefore = consoleLogSpy.mock.calls.length;
      logger.debug('Debug message');
      // No new calls should be made
      expect(consoleLogSpy.mock.calls.length).toBe(callCountBefore);
    });

    test('should output when minLevel is DEBUG', () => {
      logger.CONFIG.minLevel = 0; // DEBUG level
      const callCountBefore = consoleLogSpy.mock.calls.length;
      logger.debug('Debug message');
      // Should have one new call
      expect(consoleLogSpy.mock.calls.length).toBe(callCountBefore + 1);
    });
  });

  describe('error()', () => {
    test('should handle Error objects', () => {
      const testError = new Error('Test error message');
      testError.code = 'TEST_CODE';

      logger.error('An error occurred', testError);

      const call = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.context.error.name).toBe('Error');
      expect(parsed.context.error.message).toBe('Test error message');
      expect(parsed.context.error.code).toBe('TEST_CODE');
      expect(parsed.context.error.stack).toBeDefined();
    });

    test('should handle plain context objects', () => {
      logger.error('An error occurred', { errorCode: 'ABC' });

      const call = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.context.errorCode).toBe('ABC');
    });

    test('should merge additional context with Error', () => {
      const testError = new Error('Test');
      logger.error('Error', testError, { userId: '123' });

      const call = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.context.error.message).toBe('Test');
      expect(parsed.context.userId).toBe('123');
    });
  });

  describe('fatal()', () => {
    test('should output to console.error', () => {
      logger.fatal('Fatal error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should include FATAL level', () => {
      logger.fatal('Fatal error');

      const call = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('FATAL');
    });
  });

  describe('createRequestLogger()', () => {
    const mockRequest = {
      method: 'POST',
      url: 'https://example.com/api/fortune',
      headers: {
        get: jest.fn((header) => {
          const headers = {
            'CF-Ray': 'abc123def456',
            'User-Agent': 'Mozilla/5.0 Test',
            'CF-Connecting-IP': '1.2.3.4'
          };
          return headers[header] || null;
        })
      }
    };

    test('should create logger with request ID', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);
      expect(reqLogger.requestId).toBe('abc123def456');
    });

    test('should have all logging methods', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);

      expect(typeof reqLogger.debug).toBe('function');
      expect(typeof reqLogger.info).toBe('function');
      expect(typeof reqLogger.warn).toBe('function');
      expect(typeof reqLogger.error).toBe('function');
      expect(typeof reqLogger.fatal).toBe('function');
    });

    test('should include request context in logs', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);
      reqLogger.info('Test message');

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.context.method).toBe('POST');
      expect(parsed.context.url).toBe('https://example.com/api/fortune');
      expect(parsed.context.ip).toBe('1.2.3.4');
    });

    test('logRequest should log request received', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);
      reqLogger.logRequest();

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.message).toBe('Request received');
    });

    test('logResponse should log completion with status and duration', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);
      reqLogger.logResponse(200, 150);

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.message).toBe('Request completed');
      expect(parsed.context.statusCode).toBe(200);
      expect(parsed.context.duration).toBe('150ms');
    });

    test('logApiCall should log external API calls', () => {
      const reqLogger = logger.createRequestLogger(mockRequest);
      reqLogger.logApiCall('OpenAI', true, 500, { model: 'gpt-4o-mini' });

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.message).toBe('External API call: OpenAI');
      expect(parsed.context.success).toBe(true);
      expect(parsed.context.duration).toBe('500ms');
      expect(parsed.context.model).toBe('gpt-4o-mini');
    });

    test('should generate request ID if not in headers', () => {
      const requestWithoutId = {
        method: 'GET',
        url: 'https://example.com/test',
        headers: {
          get: jest.fn(() => null)
        }
      };

      const reqLogger = logger.createRequestLogger(requestWithoutId);
      expect(reqLogger.requestId).toBeDefined();
      expect(typeof reqLogger.requestId).toBe('string');
    });
  });

  describe('errorTracker', () => {
    test('should track errors', () => {
      logger.errorTracker.track('API_ERROR', { api: 'OpenAI' });

      const stats = logger.errorTracker.getStats();
      expect(stats.total).toBe(1);
      expect(stats.byType.API_ERROR).toBe(1);
    });

    test('should count multiple error types', () => {
      logger.errorTracker.track('API_ERROR', {});
      logger.errorTracker.track('API_ERROR', {});
      logger.errorTracker.track('VALIDATION_ERROR', {});

      const stats = logger.errorTracker.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byType.API_ERROR).toBe(2);
      expect(stats.byType.VALIDATION_ERROR).toBe(1);
    });

    test('should return recent errors', () => {
      logger.errorTracker.track('ERROR_1', { id: 1 });
      logger.errorTracker.track('ERROR_2', { id: 2 });
      logger.errorTracker.track('ERROR_3', { id: 3 });

      const stats = logger.errorTracker.getStats();
      expect(stats.recent.length).toBe(3);
    });

    test('should limit tracked errors', () => {
      for (let i = 0; i < 150; i++) {
        logger.errorTracker.track('BULK_ERROR', { index: i });
      }

      const stats = logger.errorTracker.getStats();
      expect(stats.total).toBe(100);
    });

    test('should clear errors', () => {
      logger.errorTracker.track('TEST_ERROR', {});
      logger.errorTracker.clear();

      const stats = logger.errorTracker.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('performanceMonitor', () => {
    test('should record metrics', () => {
      logger.performanceMonitor.record('api_latency', 100);
      logger.performanceMonitor.record('api_latency', 200);
      logger.performanceMonitor.record('api_latency', 150);

      const summary = logger.performanceMonitor.getSummary('api_latency');
      expect(summary.count).toBe(3);
      expect(summary.min).toBe(100);
      expect(summary.max).toBe(200);
      expect(summary.avg).toBe(150);
    });

    test('should return null for unknown metric', () => {
      const summary = logger.performanceMonitor.getSummary('unknown_metric');
      expect(summary).toBeNull();
    });

    test('should get all summaries', () => {
      logger.performanceMonitor.record('metric_a', 100);
      logger.performanceMonitor.record('metric_b', 200);

      const summaries = logger.performanceMonitor.getAllSummaries();
      expect(summaries.metric_a).toBeDefined();
      expect(summaries.metric_b).toBeDefined();
    });

    test('should clear metrics', () => {
      logger.performanceMonitor.record('test_metric', 100);
      logger.performanceMonitor.clear();

      const summary = logger.performanceMonitor.getSummary('test_metric');
      expect(summary).toBeNull();
    });

    test('should handle single value correctly', () => {
      logger.performanceMonitor.record('single', 500);

      const summary = logger.performanceMonitor.getSummary('single');
      expect(summary.count).toBe(1);
      expect(summary.min).toBe(500);
      expect(summary.max).toBe(500);
      expect(summary.avg).toBe(500);
    });
  });

  describe('loggingMiddleware', () => {
    test('should attach logger to context', async () => {
      const context = {
        request: {
          method: 'POST',
          url: 'https://example.com/api/test',
          headers: {
            get: jest.fn(() => null)
          }
        }
      };

      const next = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));

      await logger.loggingMiddleware(context, next);

      expect(context.logger).toBeDefined();
      expect(typeof context.logger.info).toBe('function');
    });

    test('should log request and response', async () => {
      const context = {
        request: {
          method: 'GET',
          url: 'https://example.com/test',
          headers: {
            get: jest.fn(() => null)
          }
        }
      };

      const next = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));

      await logger.loggingMiddleware(context, next);

      // Should have logged request and response
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    test('should record performance metric', async () => {
      const context = {
        request: {
          method: 'GET',
          url: 'https://example.com/test',
          headers: {
            get: jest.fn(() => null)
          }
        }
      };

      const next = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));

      await logger.loggingMiddleware(context, next);

      const summary = logger.performanceMonitor.getSummary('request_duration');
      expect(summary).not.toBeNull();
      expect(summary.count).toBe(1);
    });

    test('should handle errors and track them', async () => {
      const context = {
        request: {
          method: 'POST',
          url: 'https://example.com/api/error',
          headers: {
            get: jest.fn(() => null)
          }
        }
      };

      const next = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(logger.loggingMiddleware(context, next)).rejects.toThrow('Test error');

      const stats = logger.errorTracker.getStats();
      expect(stats.total).toBe(1);
      expect(stats.byType.REQUEST_ERROR).toBe(1);
    });

    test('should return response from next handler', async () => {
      const context = {
        request: {
          method: 'GET',
          url: 'https://example.com/test',
          headers: {
            get: jest.fn(() => null)
          }
        }
      };

      const expectedResponse = new Response('Success', { status: 201 });
      const next = jest.fn().mockResolvedValue(expectedResponse);

      const response = await logger.loggingMiddleware(context, next);

      expect(response.status).toBe(201);
    });
  });

  describe('Edge Cases', () => {
    test('should handle request with missing headers', () => {
      const mockRequest = {
        method: 'GET',
        url: 'https://example.com/test',
        headers: null
      };

      // Should not throw
      expect(() => logger.createRequestLogger(mockRequest)).not.toThrow();
    });

    test('should handle undefined context gracefully', () => {
      const entry = logger.formatLogEntry('INFO', 'Test', undefined);
      expect(entry.message).toBe('Test');
    });

    test('should handle empty context object', () => {
      const entry = logger.formatLogEntry('INFO', 'Test', {});
      expect(entry.context).toBeUndefined();
    });
  });
});
