import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }),
});
