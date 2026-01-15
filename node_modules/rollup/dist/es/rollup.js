/*
  @license
	Rollup.js v4.52.0
	Fri, 19 Sep 2025 19:45:47 GMT - commit 2029f639f983289619538c60bc14eebc638c6926

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
