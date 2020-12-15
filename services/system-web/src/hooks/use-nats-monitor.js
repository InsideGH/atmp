import { useEffect, useState, useCallback } from 'react';

export function useNatsMonitor() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const refetch = useCallback(() => {
    setLoading(true);

    fetch('/api/nats/streaming/channelsz?subs=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(
        (result) => {
          const channels = result.channels.filter((channel) => channel.subscriptions);

          const aggregated = channels.map((channel) => {
            return {
              name: channel.name,
              msgs: channel.msgs,
              subscriptions: channel.subscriptions
                .map((s) => ({
                  id: s.client_id,
                  name: s.queue_name.split(':')[0],
                  is_offline: s.is_offline,
                  last_sent: s.last_sent,
                  pending_count: s.pending_count,
                  is_stalled: s.is_stalled,
                }))
                .sort((a, b) => b.last_sent - a.last_sent),
            };
          });
          setData(aggregated);
        },
        (error) => {
          console.error('error', error);
        },
      );
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { loading, data, refetch };
}
