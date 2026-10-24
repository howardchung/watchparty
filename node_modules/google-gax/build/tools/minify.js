#!/usr/bin/env node
"use strict";
// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
// Minifies proto JSON files under `build/`.
const fs_1 = require("fs");
const path = require("path");
const uglify = require("uglify-js");
async function minifyFile(filename, isJs) {
    const content = (await fs_1.promises.readFile(filename)).toString();
    let options;
    if (isJs) {
        options = {
            expression: false,
        };
    }
    else {
        options = {
            expression: true,
            compress: false,
            output: { quote_keys: true },
        };
    }
    const output = uglify.minify(content, options);
    if (output.error) {
        throw output.error;
    }
    await fs_1.promises.writeFile(filename, output.code);
}
async function main(directory) {
    const buildDir = directory !== null && directory !== void 0 ? directory : path.join(process.cwd(), 'build', 'protos');
    const files = await fs_1.promises.readdir(buildDir);
    const jsonFiles = files.filter(file => file.match(/\.json$/));
    for (const jsonFile of jsonFiles) {
        console.log(`Minifying ${jsonFile}...`);
        await minifyFile(path.join(buildDir, jsonFile), false);
    }
    const jsFiles = files.filter(file => file.match(/\.js$/));
    for (const jsFile of jsFiles) {
        console.log(`Minifying ${jsFile}...`);
        await minifyFile(path.join(buildDir, jsFile), true);
    }
    console.log('Minified all proto JS and JSON files successfully.');
}
exports.main = main;
function usage() {
    console.log(`Usage: node ${process.argv[1]} [directory]`);
    console.log('Minifies all JSON files in-place in the given directory (non-recursively).');
    console.log('If no directory is given, minifies JSON files in ./build/protos.');
}
if (require.main === module) {
    // argv[0] is node.js binary, argv[1] is script path
    if (process.argv[2] === '--help') {
        usage();
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
    main(process.argv[2]);
}
//# sourceMappingURL=minify.js.map