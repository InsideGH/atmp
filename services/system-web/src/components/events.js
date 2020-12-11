import { useState, useContext, useEffect } from "react";
import { Table, Tag, Button, Space, Checkbox, Row, Col, Card } from "antd";
import { useSubjects } from "../hooks/use-subjects";
import { useEvents } from "../hooks/use-events";
import { SocketContext } from "../context/socket-context";
import { useNatsMonitor } from "../hooks/use-nats-monitor";

const SubjectsLogCreated = "log.created";

const initial = {
  total: 0,
  pagination: {
    current: 1,
    pageSize: 15,
    total: 0,
  },
  filters: {},
  sorter: {
    field: "id",
    order: "descend",
  },
  excludedFilters: {
    subject: [SubjectsLogCreated],
  },
};

const excludedSubjectsOptions = [
  { label: SubjectsLogCreated, value: SubjectsLogCreated },
];

function Events() {
  const socketContext = useContext(SocketContext);

  const [pagination, setPagination] = useState(initial.pagination);
  const [filters, setFilters] = useState(initial.filters);
  const [sorter, setSorter] = useState(initial.sorter);
  const [excludedFilters, setExcludedFilters] = useState(
    initial.excludedFilters
  );

  const subjects = useSubjects();
  const { loading, data, total, fetchEvents } = useEvents(
    pagination,
    filters,
    sorter,
    excludedFilters,
    initial
  );
  const { data: natsData, refetch: natsRefetch } = useNatsMonitor();

  /**
   * When socket IO or our fetch function changes.
   */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, socketContext]);

  /**
   * When events data is changed, we refresh our nats monitoring data.
   */
  useEffect(() => {
    natsRefetch();
  }, [data, natsRefetch]);

  /**
   * When we change something in the events table, we update our local state. Note that the useEvents hook
   * has dependecies on these, so it will refetch automatically.
   */
  const handleTableChange = (pagination, filters, sorter) => {
    console.log("handleTableChange");
    setPagination(pagination);
    if (sorter.length || sorter.order) {
      setSorter(sorter);
    }
    setFilters(filters);
  };

  /**
   * When we interact with the excluded subjects checkboxes.
   */
  const onExcludeChange = (checkedValues) => {
    setExcludedFilters({
      subject: checkedValues,
    });
  };

  const renderNatsTags = ({ subject }) => {
    if (natsData) {
      const channel = natsData.find((ch) => ch.name === subject);
      if (channel) {
        const tags = channel.subscriptions.map((s) => {
          let color;

          if (s.is_offline) {
            color = "red";
          } else {
            if (s.pending_count === 0) {
              color = "green";
            } else {
              color = "orange";
            }
          }

          return (
            <Tag
              key={s.name}
              color={color}
            >{`${s.name}:${s.pending_count}:${s.last_sent}`}</Tag>
          );
        });
        return tags;
      }
    }
    return [];
  };

  const columns = [
    {
      title: "id",
      dataIndex: "id",
      sorter: true,
    },
    {
      title: "subject",
      dataIndex: "subject",
      sorter: {
        multiple: 1,
      },
      filters: subjects.map((x) => ({
        text: x,
        value: x,
      })),
    },
    {
      title: "nats",
      render: renderNatsTags,
    },
    {
      title: "sequence",
      dataIndex: "sequence",
      sorter: {
        multiple: 2,
      },
    },
    {
      title: "data",
      dataIndex: "data",
      render: (data) => JSON.stringify(data),
    },
    {
      title: "timestamp",
      dataIndex: "timestamp",
      sorter: true,
    },
  ];

  return (
    <>
      <Row align="bottom">
        <Col span={12}>
          <Space align="baseline">
            <Tag color={socketContext.isConnected ? "green" : "red"}>
              socket
            </Tag>
            <Tag color="green">{total} events</Tag>
            <Button
              type="primary"
              size="small"
              loading={loading}
              onClick={fetchEvents}
            >
              Refresh
            </Button>
          </Space>
        </Col>
        <Col span={12} align="right">
          <Card
            title="Excluded subjects"
            bordered={true}
            style={{ width: 300 }}
            size="small"
            align="left"
          >
            <Checkbox.Group
              options={excludedSubjectsOptions}
              defaultValue={[SubjectsLogCreated]}
              onChange={onExcludeChange}
            />
          </Card>
        </Col>
      </Row>

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
    </>
  );
}

export default Events;
