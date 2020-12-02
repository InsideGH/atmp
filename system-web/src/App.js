import { useEffect, useState } from 'react';
import { Layout, Table, Tag, Button, Space } from 'antd';

import './App.css';

const { Content } = Layout;

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

function App() {
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [data, setData] = useState([]);

  const [total, setTotal] = useState(initial.total);
  const [pagination, setPagination] = useState(initial.pagination);
  const [filters, setFilters] = useState(initial.filters);
  const [sorter, setSorter] = useState(initial.sorter);

  const fetchSubjects = () => {
    fetch('/api/system/subjects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(
        (subjects) => {
          setSubjects(subjects);
        },
        (error) => {
          console.error('subject error', error);
        },
      );
  };

  const fetchEvents = () => {
    setLoading(true);

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
    } else if (sorter) {
      body.sorter = [
        {
          field: sorter.field,
          order: sorter.order,
        },
      ];
    } else {
      body.sorter = [initial.sorter];
    }

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
  };

  useEffect(() => {
    fetchEvents();
  }, [pagination, sorter, filters]);

  useEffect(() => {
    fetchSubjects();
  }, []);

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
    <Layout>
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
        }}
      >
        <Space align="baseline">
          <Tag color="green">{total} events</Tag>
          <Button type="primary" size="small" loading={loading} onClick={fetchEvents}>
            Refresh
          </Button>
        </Space>
        <br />
        <br />
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
      </Content>
    </Layout>
  );
}

export default App;
