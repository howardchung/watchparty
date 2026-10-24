// createRequire is native in node version >= 12
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nodeDataChannel = require('../build/Release/node_datachannel.node');

export default nodeDataChannel;
