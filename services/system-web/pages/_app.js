import "../styles/globals.css";

import { useState, useEffect } from "react";
import { useServices } from "../src/hooks/use-services";
import { useSubjects } from "../src/hooks/use-subjects";
import { socketInstance } from "../src/socket";
import { SocketContext } from "../src/context/socket-context";

import { Layout } from "antd";

function MyApp({ Component, pageProps }) {
  const services = useServices();
  const subjects = useSubjects();
  const [isConnected, setIsConnected] = useState(socketInstance.connected);
  const [latestEvent, setLatestEvent] = useState(undefined);

  useEffect(() => {
    socketInstance.on("connect", () => {
      console.log("socket connect");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("socket disconnect");
      setIsConnected(false);
    });

    socketInstance.on("subject:event", (event) => {
      console.log("socket subject:event", event);
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
        services,
        subjects,
      }}
    >
      <Layout>
        <Layout.Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          <Component {...pageProps} />
        </Layout.Content>
      </Layout>
    </SocketContext.Provider>
  );
}

export default MyApp;
