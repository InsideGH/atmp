import { useEffect, useState, useCallback } from 'react';

export function useEvents(pagination, filters, sorter, initial) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const refetch = useCallback(() => {
    const body = {
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      filters,
    };

    if (sorter.length) {
      body.sorter = sorter
        .sort((a, b) => a.column.sorter.multiple - b.column.sorter.multiple)
        .map((x) => ({
          field: x.field,
          order: x.order,
        }));
    } else if (sorter && sorter.order) {
      body.sorter = [
        {
          field: sorter.field,
          order: sorter.order,
        },
      ];
    } else {
      body.sorter = [initial.sorter];
    }

    setLoading(true);

    fetch('/api/system/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          setLoading(false);
          setData(result.rows);
          setTotal(result.count);
        },
        (error) => {
          console.error('error', error);
          setLoading(false);
        },
      );
  }, [filters, initial.sorter, pagination, sorter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { loading, data, total, refetch };
}
