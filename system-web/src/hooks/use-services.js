import { useEffect, useState } from 'react';

export function useServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch('/api/system/services', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(
        (services) => {
          setServices(services);
        },
        (error) => {
          console.error('service error', error);
        },
      );
  }, []);

  return services;
}
