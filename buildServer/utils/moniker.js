"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRoomName = makeRoomName;
exports.makeUserName = makeUserName;
const fs_1 = __importDefault(require("fs"));
const resolveShard_1 = require("./resolveShard");
let adjectives = fs_1.default
    .readFileSync(process.cwd() + '/words/adjectives.txt')
    .toString()
    .split('\n');
const nouns = fs_1.default
    .readFileSync(process.cwd() + '/words/nouns.txt')
    .toString()
    .split('\n');
const verbs = fs_1.default
    .readFileSync(process.cwd() + '/words/verbs.txt')
    .toString()
    .split('\n');
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
function makeRoomName(shard) {
    let filteredAdjectives = adjectives;
    if (shard) {
        // Filter the adjective list by shard
        filteredAdjectives = adjectives.filter((adj) => (0, resolveShard_1.resolveShard)(adj) === Number(shard));
    }
    const adjective = randomElement(filteredAdjectives);
    const noun = randomElement(nouns);
    const verb = randomElement(verbs);
    return `${adjective}-${noun}-${verb}`;
}
function makeUserName() {
    return `${capFirst(randomElement(adjectives))} ${capFirst(randomElement(nouns))}`;
}
function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
