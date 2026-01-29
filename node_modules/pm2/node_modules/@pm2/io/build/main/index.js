"use strict";
const pmx_1 = require("./pmx");
const IO_KEY = Symbol.for('@pm2/io');
const isAlreadyHere = (Object.getOwnPropertySymbols(global).indexOf(IO_KEY) > -1);
const io = isAlreadyHere ? global[IO_KEY] : new pmx_1.default().init();
global[IO_KEY] = io;
module.exports = io;
