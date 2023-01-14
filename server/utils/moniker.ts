import fs from 'fs';
import path from 'path';
import { resolveShard } from './resolveShard';

let adjectives = fs
  .readFileSync(path.resolve(__dirname, './adjectives.txt'))
  .toString()
  .split('\n');
const nouns = fs
  .readFileSync(path.resolve(__dirname, './nouns.txt'))
  .toString()
  .split('\n');
const verbs = fs
  .readFileSync(path.resolve(__dirname, './verbs.txt'))
  .toString()
  .split('\n');
const randomElement = (array: Array<string>) =>
  array[Math.floor(Math.random() * array.length)];

export function makeName(shard: number | undefined) {
  let filteredAdjectives = adjectives;
  if (shard) {
    // Filter the adjective list by shard
    filteredAdjectives = adjectives.filter(
      (adj) => resolveShard(adj) === Number(shard)
    );
  }
  const adjective = randomElement(filteredAdjectives);
  const noun = randomElement(nouns);
  const verb = randomElement(verbs);
  return `${adjective}-${noun}-${verb}`;
}
