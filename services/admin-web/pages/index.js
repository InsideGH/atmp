import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { fetchDeviceLogs } from "../src/fetch-device-logs";

export default function Home({ serverSideProps }) {
  const [data, setData] = useState(serverSideProps.logs);
  const { count, rows } = data;

  console.log("## client", rows.length, count);

  const fetchClient = async () => {
    const logs = await fetchDeviceLogs({ offset: 0, limit: 20 });
    setData(logs);
  };

  useEffect(() => {
    console.log("## useEffect");
    fetchClient();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Panda Care admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Panda Care Admin</h1>

        <h3>device count: {count}</h3>
        <ul>
          {rows.map((log) => (
            <li key={log.id}>{JSON.stringify(log)}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  console.log("## server");
  const logs = await fetchDeviceLogs({ offset: 0, limit: 5 });

  return {
    props: {
      serverSideProps: {
        logs,
      },
    },
  };
}
