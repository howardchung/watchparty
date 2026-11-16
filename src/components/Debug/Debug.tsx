import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { serverPath } from "../../utils/utils";
import { useFetch } from "../../utils/useFetch.hook";
import CountUp from "react-countup";
import { Table } from "../UI/UI";

const timeSeriesUrl = serverPath + `/timeSeries${window.location.search}`;
const statsUrl = serverPath + `/stats${window.location.search}`;

const Debug = () => {
  const timeSeries: any[] = useFetch(timeSeriesUrl) ?? [];
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
      last = nextState.current;
    };
    update();
    setInterval(update, 10000);
  }, []);
  const keys = Object.keys(timeSeries.slice(-1)[0] ?? {});
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          flexWrap: "wrap",
          flexDirection: "column",
          height: "2000px",
          gap: 16,
        }}
      >
        {Object.keys(state.current).map((k) => {
          if (k === "vmManagerStats") {
            return (
              <div key={k} style={{ overflow: "auto" }}>
                <pre style={{ fontSize: 12 }}>
                  {JSON.stringify(state.current[k], null, 2)}
                </pre>
              </div>
            );
          } else if (Array.isArray(state.current[k])) {
            return (
              <div
                key={k}
                style={{
                  maxWidth: k === "currentRoomData" ? "400px" : undefined,
                  overflow: "auto",
                }}
              >
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{k}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {state.current[k].map((row: any, idx: number) => {
                      return (
                        <Table.Tr key={idx}>
                          <Table.Td>
                            {k === "currentRoomData" ? (
                              <div style={{ wordBreak: "break-all" }}>
                                {JSON.stringify(row, null, 2)}
                              </div>
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
            return (
              <div key={k} style={{ overflow: "auto" }}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th colSpan={2}>{k}</Table.Th>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Th>Key</Table.Th>
                      <Table.Th>Value</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.keys(state.current[k]).map((key) => {
                      return (
                        <Table.Tr key={key}>
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
        .filter((k) => k !== "time")
        .map((key) => {
          return (
            <LineChart
              key={key}
              width={1400}
              height={400}
              data={rev}
              margin={{
                top: 5,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={key} stroke="#818cf8" />
            </LineChart>
          );
        })}
    </div>
  );
};

export default Debug;
