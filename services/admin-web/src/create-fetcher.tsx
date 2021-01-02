import { Services } from '../common/services';

const isServer = typeof window === 'undefined';

export const createFetcher = (service: Services, path: string, options: RequestInit = {}) => {
  const base = isServer ? `http://${service}-srv.default.svc.cluster.local:3000` : `/api/${service}`;
  const url = `${base}${path}`;
  return fetch(url, options);
};
