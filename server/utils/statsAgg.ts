import axios from 'axios';
import config from '../config';
import ecosystem from '../ecosystem.config';

export async function statsAgg() {
  const ports =
    process.env.NODE_ENV === 'development'
      ? [8080]
      : ecosystem.apps.map((app) => app.env?.PORT).filter(Boolean);

  const shardReqs = ports.map((port) =>
    axios({
      url: `http://localhost:${port}/stats?key=${config.STATS_KEY}`,
      validateStatus: () => true,
    }),
  );

  let stats: any = {};
  const shardData = await Promise.all(shardReqs);
  shardData.forEach((shard) => {
    const data = shard.data;
    stats = combine(stats, data);
  });
  return stats;
}

function combine(a: any, b: any, forceCombine = false) {
  const result = { ...a };
  Object.keys(b).forEach((key) => {
    if (key.startsWith('current') || forceCombine) {
      if (typeof b[key] === 'number') {
        result[key] = (result[key] || 0) + b[key];
      } else if (typeof b[key] === 'string') {
        result[key] = (result[key] || '') + b[key];
      } else if (Array.isArray(b[key])) {
        result[key] = [...(result[key] || []), ...b[key]];
      } else if (typeof b[key] === 'object') {
        result[key] = combine(result[key] || {}, b[key], true);
      }
    } else {
      result[key] = a[key] || b[key];
    }
  });
  return result;
}
