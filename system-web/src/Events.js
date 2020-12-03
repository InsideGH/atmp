import { useState, useContext, useEffect } from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { useSubjects } from './hooks/use-subjects';
import { useEvents } from './hooks/use-events';
import { SocketContext } from './context/socket-context';

const initial = {
  total: 0,
  pagination: {
    current: 1,
    pageSize: 15,
    total: 0,
  },
  filters: {},
  sorter: {
    field: 'id',
    order: 'descend',
  },
};

function Events() {
  const socketContext = useContext(SocketContext);

  const [pagination, setPagination] = useState(initial.pagination);
  const [filters, setFilters] = useState(initial.filters);
  const [sorter, setSorter] = useState(initial.sorter);

  const subjects = useSubjects();
  const { loading, data, total, refetch } = useEvents(pagination, filters, sorter, initial);

  useEffect(() => {
    refetch();
  }, [refetch, socketContext]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    if (sorter.length || sorter.order) {
      setSorter(sorter);
    }
    setFilters(filters);
  };

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: 'subject',
      dataIndex: 'subject',
      sorter: {
        multiple: 1,
      },
      filters: subjects.map((x) => ({
        text: x,
        value: x,
      })),
    },
    {
      title: 'sequence',
      dataIndex: 'sequence',
      sorter: {
        multiple: 2,
      },
    },
    {
      title: 'data',
      dataIndex: 'data',
      render: (data) => JSON.stringify(data),
    },
    {
      title: 'timestamp',
      dataIndex: 'timestamp',
      sorter: true,
    },
  ];

  return (
    <>
      <Space align="baseline">
        <Tag color={socketContext.isConnected ? 'green' : 'red'}>socket</Tag>
        <Tag color="green">{total} events</Tag>
        <Button type="primary" size="small" loading={loading} onClick={refetch}>
          Refresh
        </Button>
      </Space>

      <Table
        size="small"
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={{
          ...pagination,
          total,
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
}

export default Events;
