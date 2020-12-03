import './App.css';

import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Events from './Events';
import LatestEvent from './LatestEvent';
import { socketInstance } from './socket';
import { SocketContext } from './context/socket-context';

const { Content } = Layout;

function App() {
  const [isConnected, setIsConnected] = useState(socketInstance.connected);
  const [latestEvent, setLatestEvent] = useState(undefined);

  useEffect(() => {
    socketInstance.on('connect', () => {
      console.log('app: socket connect');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('app: socket disconnect');
      setIsConnected(false);
    });

    socketInstance.on('socket:new:event', (event) => {
      console.log('app: socket new:event', event);
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
          <LatestEvent />
          <br/>
          <Events />
        </Content>
      </Layout>
    </SocketContext.Provider>
  );
}

export default App;
