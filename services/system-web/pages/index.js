import Head from "next/head";

import { Tabs } from "antd";
import LatestEvent from "../src/components/latest-event";
import Events from "../src/components/events";
import ServiceLogs from "../src/components/service-logs";

import { useContext } from "react";
import { SocketContext } from "../src/context/socket-context";

export default function Home() {
  const socketContext = useContext(SocketContext);
  const services = socketContext.services;

  return (
    <div>
      <Head>
        <title>Panda Care system</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Tabs defaultActiveKey="events" tabPosition="left">
        <Tabs.TabPane tab={"events"} key="events">
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
    </div>
  );
}
