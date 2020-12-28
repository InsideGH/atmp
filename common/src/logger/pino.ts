import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint: false,
});

export const apiLogger = logger.child({ domain: 'API' });

export const eventLogger = logger.child({ domain: 'EVENT' });

export const systemLogger = logger.child({ domain: 'SYSTEM' });

export const clientWebAdminLogger = logger.child({ domain: 'CLIENT_WEBADMIN' });
