import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { serverPath } from '../../utils/utils';
import { useFetch } from '../../utils/useFetch.hook';
import CountUp from 'react-countup';
import { Table } from '@mantine/core';

const timeSeriesUrl = serverPath + `/timeSeries${window.location.search}`;
// const timeSeriesUrl = 'https://www.watchparty.me' + `/timeSeries${window.location.search}`;
const statsUrl = serverPath + `/stats${window.location.search}`;
// const statsUrl = 'https://www.watchparty.me' + `/stats${window.location.search}`;

// Rendering:
// Anything that's a Record<string, number> should render as 2 column table
// e.g. counts, roomsizecounts, per shard stats
// vBrowserClientIDs etc. should be converted to key/value pairs
// vmManagerStats and currentRoomData should render in JSON blocks

const Debug = () => {
  let timeSeries: any[] = useFetch(timeSeriesUrl) ?? [];
  const rev = [...timeSeries].reverse();
  const [state, setState] = useState({
    current: {} as Record<string, any>,
    last: {} as Record<string, any>,
  });
  useEffect(() => {
    let last = state.current;
    const update = async () => {
      const resp = await fetch(statsUrl);
      const json = await resp.json();
      const nextState = { current: json, last };
      setState(nextState);
      // Save the value for the next update
      last = nextState.current;
    };
    update();
    setInterval(update, 10000);
  }, []);
  // Get the keys from the last/mostrecent element
  const keys = Object.keys(timeSeries.slice(-1)[0] ?? {});
  return (
    <div>
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          flexWrap: 'wrap',
          flexDirection: 'column',
          height: '800px',
        }}
      >
        {Object.keys(state.current).map((k) => {
          if (k === 'vmManagerStats') {
            return (
              <div style={{ overflow: 'auto' }}>
                <pre style={{ fontSize: 12 }} key={k}>
                  {JSON.stringify(state.current[k], null, 2)}
                </pre>
              </div>
            );
          } else if (Array.isArray(state.current[k])) {
            // One column table
            return (
              <div
                style={{
                  maxWidth: k === 'currentRoomData' ? '400px' : undefined,
                  overflow: 'auto',
                }}
              >
                <Table style={{}} key={k}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{k}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {state.current[k].map((row) => {
                      return (
                        <Table.Tr>
                          <Table.Td>
                            {k === 'currentRoomData' ? (
                              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(row, null, 2)}</pre>
                            ) : (
                              row
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </div>
            );
          } else {
            // Map
            return (
              <div style={{ overflow: 'auto' }}>
                <Table style={{}} key={k}>
                  <Table.Thead>
                    <div>{k}</div>
                    <Table.Tr>
                      <Table.Th>Key</Table.Th>
                      <Table.Th>Value</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.keys(state.current[k]).map((key) => {
                      return (
                        <Table.Tr>
                          <Table.Td>{key}</Table.Td>
                          <Table.Td>
                            <CountUp
                              start={
                                state.last[k]?.[key] ?? state.current[k][key]
                              }
                              end={state.current[k][key]}
                              duration={10}
                              delay={0}
                              useEasing={false}
                            />
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </div>
            );
          }
        })}
      </div>
      {keys
        .filter((k) => k !== 'time')
        .map((key) => {
          return (
            <LineChart
              width={1400}
              height={400}
              data={rev}
              margin={{
                top: 5,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={key} stroke="#8884d8" />
            </LineChart>
          );
        })}
    </div>
  );
};

export default Debug;
