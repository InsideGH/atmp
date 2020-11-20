import pino from 'pino';

export const logger = pino({
  prettyPrint: /development|test/.test(process.env.NODE_ENV!),
});
