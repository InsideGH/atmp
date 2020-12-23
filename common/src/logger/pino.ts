import pino from 'pino';

const enablePretty = /development|test/.test(process.env.NODE_ENV!);

const prettyPrint = enablePretty
  ? {
      colorize: true,
    }
  : false;

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint :false,
});

export const reqLogger = logger.child({ domain: 'API' });

export const eventLogger = logger.child({ domain: 'EVENT' });

