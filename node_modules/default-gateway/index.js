import {isIP} from "node:net";
import {execa, execaSync} from "execa";
import {platform, type, release, networkInterfaces} from "node:os";

const plat = platform();
const dests = new Set(["default", "0.0.0.0", "0.0.0.0/0", "::", "::/0"]);
let promise, sync;

if (plat === "linux") {
  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const results = /default( via .+?)?( dev .+?)( |$)/.exec(line) || [];
      const gateway = (results[1] || "").substring(5);
      const iface = (results[2] || "").substring(5);
      if (gateway && isIP(gateway)) { // default via 1.2.3.4 dev en0
        return {gateway, version: family, int: (iface ?? null)};
      } else if (iface && !gateway) { // default via dev en0
        const interfaces = networkInterfaces();
        const addresses = interfaces[iface];
        for (const addr of addresses || []) {
          if (Number(family.substring(3)) === family && isIP(addr.address)) {
            return {gateway: addr.address, version: family, int: (iface ?? null)};
          }
        }
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("ip", [`-${family}`, "r"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("ip", [`-${family}`, "r"]);
    return parse(stdout, family);
  };
} else if (plat === "darwin") {
  // The IPv4 gateway is in column 3 in Darwin 19 (macOS 10.15 Catalina) and higher,
  // previously it was in column 5
  const v4IfaceColumn = parseInt(release()) >= 19 ? 3 : 5;

  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[family === 4 ? v4IfaceColumn : 3];
      if (dests.has(target) && gateway && isIP(gateway)) {
        return {gateway, version: family, int: (iface ?? null)};
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };
} else if (plat === "win32") {
  const gwArgs = "path Win32_NetworkAdapterConfiguration where IPEnabled=true get DefaultIPGateway,GatewayCostMetric,IPConnectionMetric,Index /format:table".split(" ");
  const ifArgs = index => `path Win32_NetworkAdapter where Index=${index} get NetConnectionID,MACAddress /format:table`.split(" ");

  const spawnOpts = {
    windowsHide: true,
  };

  // Parsing tables like this. The final metric is GatewayCostMetric + IPConnectionMetric
  //
  // DefaultIPGateway             GatewayCostMetric  Index  IPConnectionMetric
  // {"1.2.3.4", "2001:db8::1"}   {0, 256}           12     25
  // {"2.3.4.5"}                  {25}               12     55
  function parseGwTable(gwTable, family) { // eslint-disable-line no-inner-declarations
    let [bestGw, bestMetric, bestId] = [null, null, null];

    for (let line of (gwTable || "").trim().split(/\r?\n/).splice(1)) {
      line = line.trim();
      const [_, gwArr, gwCostsArr, id, ipMetric] = /({.+?}) +({.+?}) +([0-9]+) +([0-9]+)/.exec(line) || [];
      if (!gwArr) continue;

      const gateways = (gwArr.match(/"(.+?)"/g) || []).map(match => match.substring(1, match.length - 1));
      const gatewayCosts = (gwCostsArr.match(/[0-9]+/g) || []);

      for (const [index, gateway] of Object.entries(gateways)) {
        if (!gateway || isIP(gateway) !== family) continue;

        const metric = parseInt(gatewayCosts[index]) + parseInt(ipMetric);
        if (!bestGw || metric < bestMetric) {
          [bestGw, bestMetric, bestId] = [gateway, metric, id];
        }
      }
    }

    if (bestGw) return [bestGw, bestId];
  }

  function parseIfTable(ifTable) { // eslint-disable-line no-inner-declarations
    const line = (ifTable || "").trim().split("\n")[1];

    let [mac, name] = line.trim().split(/\s+/);
    mac = mac.toLowerCase();

    // try to get the interface name by matching the mac to os.networkInterfaces to avoid wmic's encoding issues
    // https://github.com/silverwind/default-gateway/issues/14
    for (const [osname, addrs] of Object.entries(networkInterfaces())) {
      for (const addr of addrs) {
        if (addr?.mac?.toLowerCase() === mac) {
          return osname;
        }
      }
    }
    return name;
  }

  promise = async family => {
    const {stdout} = await execa("wmic", gwArgs, spawnOpts);
    const [gateway, id] = parseGwTable(stdout, family) || [];
    if (!gateway) throw new Error("Unable to determine default gateway");

    let name;
    if (id) {
      const {stdout} = await execa("wmic", ifArgs(id), spawnOpts);
      name = parseIfTable(stdout);
    }

    return {gateway, version: family, int: name ?? null};
  };

  sync = family => {
    const {stdout} = execaSync("wmic", gwArgs, spawnOpts);
    const [gateway, id] = parseGwTable(stdout, family) || [];
    if (!gateway) throw new Error("Unable to determine default gateway");

    let name;
    if (id) {
      const {stdout} = execaSync("wmic", ifArgs(id), spawnOpts);
      name = parseIfTable(stdout);
    }

    return {gateway, version: family, int: name ?? null};
  };
} else if (plat === "android") {
  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const [_, gateway, iface] = /default via (.+?) dev (.+?)( |$)/.exec(line) || [];
      if (gateway && isIP(gateway)) {
        return {gateway, version: family, int: (iface ?? null)};
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("ip", [`-${family}`, "r"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("ip", [`-${family}`, "r"]);
    return parse(stdout, family);
  };
} else if (plat === "freebsd") {
  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const [target, gateway, _, iface] = line.split(/ +/) || [];
      if (dests.has(target) && gateway && isIP(gateway)) {
        return {gateway, version: family, int: (iface ?? null)};
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };
} else if (plat === "aix" && type() === "OS400") {
  const db2util = "/QOpenSys/pkgs/bin/db2util";
  const sql = "select NEXT_HOP, LOCAL_BINDING_INTERFACE from QSYS2.NETSTAT_ROUTE_INFO where ROUTE_TYPE='DFTROUTE' and NEXT_HOP!='*DIRECT' and CONNECTION_TYPE=?";

  const parse = (stdout, family) => {
    try {
      const resultObj = JSON.parse(stdout);
      const gateway = resultObj.records[0].NEXT_HOP;
      const iface = resultObj.records[0].LOCAL_BINDING_INTERFACE;
      return {gateway, version: family, iface};
    } catch {}
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa(db2util, [sql, "-p", `IPV${family}`, "-o", "json"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync(db2util, [sql, "-p", `IPV${family}`, "-o", "json"]);
    return parse(stdout, family);
  };
} else if (plat === "openbsd") {
  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[7];
      if (dests.has(target) && gateway && isIP(gateway)) {
        return {gateway, version: family, int: (iface ?? null)};
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };
} else if (plat === "sunos" || (plat === "aix" && type() !== "OS400")) { // AIX `netstat` output is compatible with Solaris
  const parse = (stdout, family) => {
    for (const line of (stdout || "").trim().split("\n")) {
      const results = line.split(/ +/) || [];
      const target = results[0];
      const gateway = results[1];
      const iface = results[5];
      if (dests.has(target) && gateway && isIP(gateway)) {
        return {gateway, version: family, int: (iface ?? null)};
      }
    }
    throw new Error("Unable to determine default gateway");
  };

  promise = async family => {
    const {stdout} = await execa("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };

  sync = family => {
    const {stdout} = execaSync("netstat", ["-rn", "-f", family === 4 ? "inet" : "inet6"]);
    return parse(stdout, family);
  };
} else {
  promise = (_) => { throw new Error("Unsupported Platform"); };
  sync = (_) => { throw new Error("Unsupported Platform"); };
}

export const gateway4async = () => promise(4);
export const gateway6async = () => promise(6);
export const gateway4sync = () => sync(4);
export const gateway6sync = () => sync(6);

export default {
  gateway4async,
  gateway6async,
  gateway4sync,
  gateway6sync,
};
