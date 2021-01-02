import { Services } from '../common/services';
import { createFetcher } from './create-fetcher';

const createLog = (type: string, msg: string) => {
  createFetcher(Services.SYSTEM, '/logger', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      msg,
    }),
  })
    .then(async (response) => {
      const json = await response.json();

      console.log('value json', json);
    })
    .catch((reason) => {
      console.log('reason', reason);
    });
};

export const loggers = {
  debug: (msg: string) => {
    console.log(msg);
    createLog('debug', msg);
  },
  info: (msg: string) => {
    console.info(msg);
    createLog('info', msg);
  },
  error: (msg: string) => {
    console.error(msg);
    createLog('error', msg);
  },
};
