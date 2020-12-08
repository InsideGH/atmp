import { service } from "./service";

export const fetchDeviceLogs = async ({ offset, limit }) => {
  const res = await service.devices.fetch("/logs", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offset,
      limit,
    }),
  });
  return await res.json();
};
