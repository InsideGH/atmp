import { services } from './services';

export interface DeviceLogs {
  count: number;
  rows: DeviceLogRows[];
}

export interface DeviceLogRows {
  id: number;
}

export const fetchDeviceLogs: (arg: { offset: number; limit: number }) => Promise<DeviceLogs> = async ({ offset, limit }) => {
  const res = await services.devices.fetch('/logs', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offset,
      limit,
    }),
  });
  const json = await res.json();
  return json as DeviceLogs;
};
