import { runWptTests } from './wpt.js';

// Some tests also fail in Chrome
// We don't also care of them
let chromeFailedTests = [];
let totalNumberOfTests = 0;

export async function runChromeTests(wptTestList) {
    chromeFailedTests = [];
    totalNumberOfTests = 0;
    let results = await runWptTests(wptTestList, true);
    for (let i = 0; i < results.length; i++) {
        totalNumberOfTests += results[i].result?.length || 0;
        if (results[i].result && results[i].result.some((test) => test.status === 1)) {
            chromeFailedTests.push({
                test: results[i].test,
                result: results[i].result.filter((test) => test.status === 1),
            });
        }
    }
}

export function getChromeFailedTests() {
    return chromeFailedTests;
}

export function isTestForChromeFailed(testPath, testName) {
    return chromeFailedTests.some(
        (test) =>
            test.test === testPath && test.result.some((result) => result.name === testName && result.status === 1),
    );
}

export function getTotalNumberOfTests() {
    return totalNumberOfTests;
}

// Test
// (async () => {
//     await runChromeTests();
//     console.log(getChromeFailedTests());
// })();
