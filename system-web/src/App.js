import './App.css';

import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Events from './Events';
import LatestEvent from './LatestEvent';
import { socketInstance } from './socket';
import { SocketContext } from './context/socket-context';
import { Tabs } from 'antd';
import { useServices } from './hooks/use-services';
import ServiceLogs from './ServiceLogs';

const { Content } = Layout;

function App() {
  const services = useServices();
  const [isConnected, setIsConnected] = useState(socketInstance.connected);
  const [latestEvent, setLatestEvent] = useState(undefined);

  useEffect(() => {
    socketInstance.on('connect', () => {
      console.log('socket connect');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('socket disconnect');
      setIsConnected(false);
    });

    socketInstance.on('subject:event', (event) => {
      console.log('socket subject:event', event);
      setLatestEvent(event);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        latestEvent,
      }}
    >
      <Layout>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          <Tabs defaultActiveKey="events" tabPosition="left">
            <Tabs.TabPane tab={'events'} key="events">
              <LatestEvent />
              <br />
              <Events />
            </Tabs.TabPane>
            {services.map((service) => (
              <Tabs.TabPane tab={service} key={service}>
                <ServiceLogs service={service} />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Content>
      </Layout>
    </SocketContext.Provider>
  );
}

export default App;
