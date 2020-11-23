import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint: /development|test/.test(process.env.NODE_ENV!),
});
