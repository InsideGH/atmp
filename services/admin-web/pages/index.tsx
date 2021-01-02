import Head from 'next/head';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import { fetchDeviceLogs, DeviceLogs } from '../src/fetch-device-logs';
import { GetServerSideProps } from 'next';
import { loggers } from '../src/loggers';

export default function Home(deviceLogs: DeviceLogs) {
  const [data, setData] = useState(deviceLogs);
  const { count, rows } = data;

  const fetchClient = async () => {
    const logs = await fetchDeviceLogs({ offset: 0, limit: 20 });
    setData(logs);
  };

  useEffect(() => {
    loggers.info(`Home react component useEffect isServer=${typeof window === 'undefined'}`);
    fetchClient();
  }, []);

  loggers.info(`Home react component render isServer=${typeof window === 'undefined'}`);

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

export const getServerSideProps: GetServerSideProps<DeviceLogs> = async () => {
  const deviceLogs = await fetchDeviceLogs({ offset: 0, limit: 5 });

  loggers.info(`Home react component getServerSideProps`);

  return {
    props: {
      ...deviceLogs,
    },
  };
};
