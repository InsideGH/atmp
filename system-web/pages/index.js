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
  );
}
