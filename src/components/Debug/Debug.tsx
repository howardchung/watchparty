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
import { serverPath } from '../../utils';

const timeSeriesUrl = serverPath + `/timeSeries${window.location.search}`;

const Debug = () => {
  const [data, setData] = useState([]);
  // eslint-disable-next-line
  useEffect(
    (async () => {
      const response = await fetch(timeSeriesUrl);
      const json = await response.json();
      json.reverse();
      setData(json);
    }) as any,
    [setData]
  );
  const keys = Object.keys(data.slice(-1)[0] ?? {});
  return (
    <>
      {keys.map((key) => (
        <LineChart
          width={1400}
          height={400}
          data={data}
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
      ))}
    </>
  );
};

export default Debug;
