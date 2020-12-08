const isServer = typeof window === "undefined";

const createFetcher = (service, path, options = {}) => {
  const base = isServer
    ? `http://${service}-srv.default.svc.cluster.local:3000`
    : `/api/${service}`;

  const url = `${base}${path}`;

  return fetch(url, options);
};

export const service = {
  devices: {
    fetch: (path, options) => createFetcher("devices", path, options),
  },
  patients: {
    fetch: (path, options) => createFetcher("patients", path, options),
  },
};
