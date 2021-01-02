import { Services } from '../common/services';
import { createFetcher } from './create-fetcher';

export const services = {
  devices: {
    fetch: (path: string, options: RequestInit) => createFetcher(Services.DEVICES, path, options),
  },
  patients: {
    fetch: (path: string, options: RequestInit) => createFetcher(Services.PATIENTS, path, options),
  },
};
