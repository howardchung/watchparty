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
  useEffect(
    (async () => {
      const response = await fetch(timeSeriesUrl);
      const json = await response.json();
      json.reverse();
      setData(json);
      return undefined;
    }) as any,
    []
  );
  const keys = Object.keys(data[0] ?? {});
  return (
    <>
      {keys.map((key) => (
        <LineChart
          width={1300}
          height={400}
          data={data}
          margin={{
            top: 5,
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
