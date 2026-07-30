#!/usr/bin/env node
"use strict";
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.generateRootName = void 0;
const fs = require("fs");
const path = require("path");
const util = require("util");
const pbjs = require("protobufjs-cli/pbjs");
const pbts = require("protobufjs-cli/pbts");
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);
const pbjsMain = util.promisify(pbjs.main);
const pbtsMain = util.promisify(pbts.main);
const PROTO_LIST_REGEX = /_proto_list\.json$/;
const apacheLicense = `// Copyright ${new Date().getFullYear()} Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

`;
/**
 * Recursively scans directories starting from `directory` and finds all files
 * matching `PROTO_LIST_REGEX`.
 *
 * @param {string} directory Path to start the scan from.
 * @return {Promise<string[]} Resolves to an array of strings, each element is a full path to a matching file.
 */
async function findProtoJsonFiles(directory) {
    const result = [];
    const files = await readdir(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const fileStat = await stat(fullPath);
        if (fileStat.isFile() && file.match(PROTO_LIST_REGEX)) {
            result.push(fullPath);
        }
        else if (fileStat.isDirectory()) {
            const nested = await findProtoJsonFiles(fullPath);
            result.push(...nested);
        }
    }
    return result;
}
/**
 * Normalizes the Linux path for the current operating system.
 *
 * @param {string} filePath Linux-style path (with forward slashes)
 * @return {string} Normalized path.
 */
function normalizePath(filePath) {
    return path.join(...filePath.split('/'));
}
function getAllEnums(dts) {
    const result = new Set();
    const lines = dts.split('\n');
    const nestedIds = [];
    let currentEnum = undefined;
    for (const line of lines) {
        const match = line.match(/^\s*(?:export )?(namespace|class|interface|enum) (\w+) .*{/);
        if (match) {
            const [, keyword, id] = match;
            nestedIds.push(id);
            if (keyword === 'enum') {
                currentEnum = nestedIds.join('.');
                result.add(currentEnum);
            }
            continue;
        }
        if (line.match(/^\s*}/)) {
            nestedIds.pop();
            currentEnum = undefined;
            continue;
        }
    }
    return result;
}
function updateDtsTypes(dts, enums) {
    const lines = dts.split('\n');
    const result = [];
    for (const line of lines) {
        let typeName = undefined;
        // Enums can be used in interfaces and in classes.
        // For simplicity, we'll check these two cases independently.
        // encoding?: (google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding|null);
        const interfaceMatch = line.match(/"?\w+"?\?: \(([\w.]+)\|null\);/);
        if (interfaceMatch) {
            typeName = interfaceMatch[1];
        }
        // public encoding: google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding;
        const classMatch = line.match(/public \w+: ([\w.]+);/);
        if (classMatch) {
            typeName = classMatch[1];
        }
        if (line.match(/\(number\|Long(?:\|null)?\)/)) {
            typeName = 'Long';
        }
        let replaced = line;
        if (typeName && enums.has(typeName)) {
            // enum: E => E|keyof typeof E  to allow all string values
            replaced = replaced.replace(typeName, `${typeName}|keyof typeof ${typeName}`);
        }
        else if (typeName === 'Uint8Array') {
            // bytes: Uint8Array => Uint8Array|string to allow base64-encoded strings
            replaced = replaced.replace(typeName, `${typeName}|string`);
        }
        else if (typeName === 'Long') {
            // Longs can be passed as strings :(
            // number|Long => number|Long|string
            replaced = replaced.replace('number|Long', 'number|Long|string');
        }
        // add brackets if we have added a |
        replaced = replaced.replace(/: ([\w.]+\|[ \w.|]+);/, ': ($1);');
        result.push(replaced);
    }
    return result.join('\n');
}
function fixJsFile(js) {
    // 1. fix protobufjs require: we don't want the libraries to
    // depend on protobufjs, so we re-export it from google-gax
    js = js.replace('require("protobufjs/minimal")', 'require("google-gax/build/src/protobuf").protobufMinimal');
    // 2. add Apache license to the generated .js file
    js = apacheLicense + js;
    // 3. reformat JSDoc reference link in the comments
    js = js.replace(/{@link (.*?)#(.*?)}/g, '{@link $1|$2}');
    return js;
}
function fixDtsFile(dts) {
    // 1. fix for pbts output to make sure we import Long properly
    dts = dts.replace('import * as Long from "long";', 'import Long = require("long");');
    if (!dts.match(/import Long = require/)) {
        dts = 'import Long = require("long");\n' + dts;
    }
    // 2. fix protobufjs import: we don't want the libraries to
    // depend on protobufjs, so we re-export it from google-gax
    dts = dts.replace('import * as $protobuf from "protobufjs"', 'import type {protobuf as $protobuf} from "google-gax"');
    // 3. add Apache license to the generated .d.ts file
    dts = apacheLicense + dts;
    // 4. major hack: update types to allow passing strings
    // where enums, longs, or bytes are expected
    const enums = getAllEnums(dts);
    dts = updateDtsTypes(dts, enums);
    return dts;
}
/**
 * Returns a combined list of proto files listed in all JSON files given.
 *
 * @param {string[]} protoJsonFiles List of JSON files to parse
 * @return {Promise<string[]>} Resolves to an array of proto files.
 */
async function buildListOfProtos(protoJsonFiles) {
    const result = [];
    for (const file of protoJsonFiles) {
        const directory = path.dirname(file);
        const content = await readFile(file);
        const list = JSON.parse(content.toString()).map((filePath) => path.join(directory, normalizePath(filePath)));
        result.push(...list);
    }
    return result;
}
/**
 * Runs `pbjs` to compile the given proto files, placing the result into
 * `./protos/protos.json`. No support for changing output filename for now
 * (but it's a TODO!)
 *
 * @param {string} rootName Name of the root object for pbjs static module (-r option)
 * @param {string[]} protos List of proto files to compile.
 */
async function compileProtos(rootName, protos, skipJson = false) {
    if (!skipJson) {
        // generate protos.json file from proto list
        const jsonOutput = path.join('protos', 'protos.json');
        if (protos.length === 0) {
            // no input file, just emit an empty object
            await writeFile(jsonOutput, '{}');
            return;
        }
        const pbjsArgs4JSON = [
            '--target',
            'json',
            '-p',
            'protos',
            '-p',
            path.join(__dirname, '..', '..', 'build', 'protos'),
            '-o',
            jsonOutput,
        ];
        pbjsArgs4JSON.push(...protos);
        await pbjsMain(pbjsArgs4JSON);
    }
    // generate protos/protos.js from protos.json
    const jsOutput = path.join('protos', 'protos.js');
    const pbjsArgs4js = [
        '-r',
        rootName,
        '--target',
        'static-module',
        '-p',
        'protos',
        '-p',
        path.join(__dirname, '..', '..', 'build', 'protos'),
        '-o',
        jsOutput,
    ];
    pbjsArgs4js.push(...protos);
    await pbjsMain(pbjsArgs4js);
    let jsResult = (await readFile(jsOutput)).toString();
    jsResult = fixJsFile(jsResult);
    await writeFile(jsOutput, jsResult);
    // generate protos/protos.d.ts
    const tsOutput = path.join('protos', 'protos.d.ts');
    const pbjsArgs4ts = [jsOutput, '-o', tsOutput];
    await pbtsMain(pbjsArgs4ts);
    let tsResult = (await readFile(tsOutput)).toString();
    tsResult = fixDtsFile(tsResult);
    await writeFile(tsOutput, tsResult);
}
/**
 *
 * @param directories List of directories to process. Normally, just the
 * `./src` folder of the given client library.
 * @return {Promise<string>} Resolves to a unique name for protobuf root to use in the JS static module, or 'default'.
 */
async function generateRootName(directories) {
    // We need to provide `-r root` option to `pbjs -t static-module`, otherwise
    // we'll have big problems if two different libraries are used together.
    // It's OK to play some guessing game here: if we locate `package.json`
    // with a package name, we'll use it; otherwise, we'll fallback to 'default'.
    for (const directory of directories) {
        const packageJson = path.resolve(directory, '..', 'package.json');
        if (fs.existsSync(packageJson)) {
            const json = JSON.parse((await readFile(packageJson)).toString());
            const name = json.name.replace(/[^\w\d]/g, '_');
            const hopefullyUniqueName = `${name}_protos`;
            return hopefullyUniqueName;
        }
    }
    return 'default';
}
exports.generateRootName = generateRootName;
/**
 * Main function. Takes an array of directories to process.
 * Looks for JSON files matching `PROTO_LIST_REGEX`, parses them to get a list of all
 * proto files used by the client library, and calls `pbjs` to compile them all into
 * JSON (`pbjs -t json`).
 *
 * Exported to be called from a test.
 *
 * @param {string[]} directories List of directories to process. Normally, just the
 * `./src` folder of the given client library.
 */
async function main(parameters) {
    const protoJsonFiles = [];
    let skipJson = false;
    const directories = [];
    for (const parameter of parameters) {
        if (parameter === '--skip-json') {
            skipJson = true;
            continue;
        }
        // it's not an option so it's a directory
        const directory = parameter;
        directories.push(directory);
        protoJsonFiles.push(...(await findProtoJsonFiles(directory)));
    }
    const rootName = await generateRootName(directories);
    const protos = await buildListOfProtos(protoJsonFiles);
    await compileProtos(rootName, protos, skipJson);
}
exports.main = main;
/**
 * Shows the usage information.
 */
function usage() {
    console.log(`Usage: node ${process.argv[1]} [--skip-json] directory ...`);
    console.log(`Finds all files matching ${PROTO_LIST_REGEX} in the given directories.`);
    console.log('Each of those files should contain a JSON array of proto files used by the');
    console.log('client library. Those proto files will be compiled to JSON using pbjs tool');
    console.log('from protobufjs.');
}
if (require.main === module) {
    if (process.argv.length <= 2) {
        usage();
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
    // argv[0] is node.js binary, argv[1] is script path
    main(process.argv.slice(2));
}
//# sourceMappingURL=compileProtos.js.map