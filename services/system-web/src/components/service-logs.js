import { useState, useContext, useEffect } from "react";
import { Table, Tag, Button, Space, Row, Col, Card, Checkbox } from "antd";
import { useLogs } from "../hooks/use-logs";
import { SocketContext } from "../context/socket-context";

const initial = {
  total: 0,
  pagination: {
    current: 1,
    pageSize: 15,
    total: 0,
  },
  sorter: {
    field: "id",
    order: "descend",
  },
  checkboxGroups: ["hide_raw_data"],
};

function stripKeys(obj, keys = []) {
  if (Array.isArray(obj)) {
    obj.forEach((x) => stripKeys(x, keys));
  } else if (typeof obj == "object") {
    for (const key in obj) {
      const value = obj[key];
      if (keys.includes(key)) {
        delete obj[key];
      } else {
        stripKeys(value, keys);
      }
    }
  }
}

const checkboxGroupOptions = [
  { label: "hide some data fields", value: "hide_raw_data" },
];

function ServiceLogs({ service }) {
  const socketContext = useContext(SocketContext);

  const [pagination, setPagination] = useState(initial.pagination);
  const [sorter, setSorter] = useState(initial.sorter);
  const [checkboxGroup, setCheckboxGroup] = useState(initial.checkboxGroups);

  const { loading, data, total, fetchLogs } = useLogs(
    service,
    pagination,
    sorter,
    initial
  );

  /**
   * When socket IO or our fetch function changes.
   */
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, socketContext]);

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
  };

  /**
   * When we interact with the excluded subjects checkboxes.
   */
  const onExcludeChange = (checkedValues) => {
    setCheckboxGroup(checkedValues);
  };

  const columns = [
    {
      title: "id",
      dataIndex: "id",
      sorter: true,
    },
    {
      title: "msg",
      dataIndex: "msg",
      sorter: {
        multiple: 1,
      },
    },
    {
      title: "data",
      dataIndex: "data",
      render: (data) => {
        if (checkboxGroup.includes("hide_raw_data")) {
          const clone = JSON.parse(JSON.stringify(data));
          stripKeys(clone, [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "versionKey",
          ]);
          return JSON.stringify(clone);
        }
        return JSON.stringify(data);
      },
    },
    {
      title: "versionKey",
      dataIndex: "data",
      render: (data) => data.versionKey,
    },
    {
      title: "createdAt",
      dataIndex: "createdAt",
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
              onClick={fetchLogs}
            >
              Refresh
            </Button>
          </Space>
        </Col>
        <Col span={12} align="right">
          <Card
            title="Options"
            bordered={true}
            style={{ width: 300 }}
            size="small"
            align="left"
          >
            <Checkbox.Group
              options={checkboxGroupOptions}
              defaultValue={["hide_raw_data"]}
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

export default ServiceLogs;
