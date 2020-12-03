import { useContext, useState, useEffect } from 'react';
import { Table, Tag, Space } from 'antd';
import { SocketContext } from './context/socket-context';

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: 'subject',
    dataIndex: 'subject',
  },
  {
    title: 'sequence',
    dataIndex: 'sequence',
  },
  {
    title: 'data',
    dataIndex: 'data',
    render: (data) => JSON.stringify(data),
  },
  {
    title: 'timestamp',
    dataIndex: 'timestamp',
  },
];

function LatestEvent() {
  const socketContext = useContext(SocketContext);
  const [timeSinceLastEvent, setTimeSinceLastEvent] = useState(undefined);

  useEffect(() => {
    const id = setInterval(() => {
      if (socketContext.latestEvent) {
        const seconds = (
          (new Date().getTime() - new Date(socketContext.latestEvent.timestamp).getTime()) /
          1000
        ).toFixed(0);
        setTimeSinceLastEvent(seconds);
      }
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [socketContext]);

  return (
    <>
      <Space align="baseline">
        <Tag color={socketContext.isConnected ? 'green' : 'red'}>socket</Tag>
        <Tag color="green">latest event</Tag>
        {timeSinceLastEvent && <Tag color="green">{timeSinceLastEvent} seconds old</Tag>}
      </Space>
      <Table
        size="small"
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={socketContext.latestEvent ? [socketContext.latestEvent] : []}
      />
    </>
  );
}

export default LatestEvent;
