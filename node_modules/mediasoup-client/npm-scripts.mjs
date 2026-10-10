import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import pkg from './package.json' with { type: 'json' };

const MAYOR_VERSION = pkg.version.split('.')[0];

// Paths for ESLint to check. Converted to string for convenience.
const ESLINT_PATHS = [
	'eslint.config.mjs',
	'jest.config.mjs',
	'npm-scripts.mjs',
	'src',
].join(' ');

// Paths for ESLint to ignore. Converted to string argument for convenience.
const ESLINT_IGNORE_PATTERN_ARGS = []
	.map(entry => `--ignore-pattern ${entry}`)
	.join(' ');

// Paths for Prettier to check/write. Converted to string for convenience.
const PRETTIER_PATHS = [
	'README.md',
	'eslint.config.mjs',
	'jest.config.mjs',
	'npm-scripts.mjs',
	'package.json',
	'tsconfig.json',
	'src',
].join(' ');

const task = process.argv[2];
const taskArgs = process.argv.slice(3).join(' ');

run();

async function run() {
	logInfo(taskArgs ? `[args:"${taskArgs}"]` : '');

	switch (task) {
		// As per NPM documentation (https://docs.npmjs.com/cli/v9/using-npm/scripts)
		// `prepare` script:
		//
		// - Runs BEFORE the package is packed, i.e. during `npm publish` and
		//   `npm pack`.
		// - Runs on local `npm install` without any arguments.
		// - NOTE: If a package being installed through git contains a `prepare`
		//   script, its dependencies and devDependencies will be installed, and
		//   the `prepare` script will be run, before the package is packaged and
		//   installed.
		//
		// So here we compile TypeScript to JavaScript.
		case 'prepare': {
			buildTypescript({ force: false });
			replaceVersion();

			break;
		}

		case 'typescript:build': {
			buildTypescript({ force: true });
			replaceVersion();

			break;
		}

		case 'typescript:watch': {
			watchTypescript();

			break;
		}

		case 'lint': {
			lint();

			break;
		}

		case 'format': {
			format();

			break;
		}

		case 'test': {
			replaceVersion();
			test();

			break;
		}

		case 'coverage': {
			replaceVersion();
			coverage();

			break;
		}

		case 'release:check': {
			checkRelease();

			break;
		}

		case 'release': {
			release();

			break;
		}

		default: {
			logError('unknown task');

			exitWithError();
		}
	}
}

function replaceVersion() {
	logInfo('replaceVersion()');

	const files = fs.readdirSync('lib', {
		withFileTypes: true,
		recursive: true,
	});

	for (const file of files) {
		if (!file.isFile()) {
			continue;
		}

		// NOTE: dirent.path is only available in Node >= 20.
		const filePath = path.join(file.parentPath ?? 'lib', file.name);
		const text = fs.readFileSync(filePath, { encoding: 'utf8' });
		const result = text.replace(/__MEDIASOUP_CLIENT_VERSION__/g, pkg.version);

		fs.writeFileSync(filePath, result, { encoding: 'utf8' });
	}
}

function deleteLib() {
	if (!fs.existsSync('lib')) {
		return;
	}

	logInfo('deleteLib()');

	fs.rmSync('lib', { recursive: true, force: true });
}

function buildTypescript({ force }) {
	if (!force && fs.existsSync('lib')) {
		return;
	}

	logInfo('buildTypescript()');

	deleteLib();

	// Generate .js CommonJS code and .d.ts TypeScript declaration files in lib/.
	executeCmd(`tsc ${taskArgs}`);
}

function watchTypescript() {
	logInfo('watchTypescript()');

	deleteLib();

	executeCmd(`tsc --watch ${taskArgs}`);
}

function lint() {
	logInfo('lint()');

	// Ensure there are no rules that are unnecessary or conflict with Prettier
	// rules.
	executeCmd('eslint-config-prettier eslint.config.mjs');

	executeCmd(
		`eslint -c eslint.config.mjs --max-warnings 0 ${ESLINT_IGNORE_PATTERN_ARGS} ${ESLINT_PATHS}`
	);

	executeCmd(`prettier --check ${PRETTIER_PATHS}`);
}

function format() {
	logInfo('format()');

	executeCmd(`prettier --write ${PRETTIER_PATHS}`);
}

function test() {
	logInfo('test()');

	executeCmd(`jest --silent false --detectOpenHandles ${taskArgs}`);
}

function coverage() {
	logInfo('coverage()');

	executeCmd(`jest --coverage ${taskArgs}`);
	executeCmd('open-cli coverage/lcov-report/index.html');
}

function installDeps() {
	logInfo('installDeps()');

	// Install/update deps.
	executeCmd('npm ci --ignore-scripts');

	// Update package-lock.json.
	executeCmd('npm install --package-lock-only --ignore-scripts');

	// Check vulnerabilities in deps (exclude dev deps).
	executeCmd('npm audit --omit=dev');
}

function checkRelease() {
	logInfo('checkRelease()');

	installDeps();
	buildTypescript({ force: true });
	replaceVersion();
	lint();
	test();
}

function release() {
	logInfo('release()');

	checkRelease();
	executeCmd(`git commit -am '${pkg.version}'`);
	executeCmd(`git tag -a ${pkg.version} -m '${pkg.version}'`);
	executeCmd(`git push origin v${MAYOR_VERSION}`);
	executeCmd(`git push origin '${pkg.version}'`);
	executeInteractiveCmd('npm publish');
}

function executeCmd(command) {
	logInfo(`executeCmd(): ${command}`);

	try {
		execSync(command, { stdio: ['ignore', process.stdout, process.stderr] });
	} catch (error) {
		logError(`executeCmd() failed, exiting: ${error}`);

		exitWithError();
	}
}

function executeInteractiveCmd(command) {
	logInfo(`executeInteractiveCmd(): ${command}`);

	try {
		execSync(command, { stdio: 'inherit', env: process.env });
	} catch (error) {
		logError(`executeInteractiveCmd() failed, exiting: ${error}`);

		exitWithError();
	}
}

function logInfo(...args) {
	// eslint-disable-next-line no-console
	console.log(`npm-scripts.mjs \x1b[36m[INFO] [${task}]\x1b[0m`, ...args);
}

// eslint-disable-next-line no-unused-vars
function logWarn(...args) {
	// eslint-disable-next-line no-console
	console.warn(`npm-scripts.mjs \x1b[33m[WARN] [${task}]\x1b\0m`, ...args);
}

function logError(...args) {
	// eslint-disable-next-line no-console
	console.error(`npm-scripts.mjs \x1b[31m[ERROR] [${task}]\x1b[0m`, ...args);
}

function exitWithError() {
	process.exit(1);
}
