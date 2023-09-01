import utils from './utils.js';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

let allResults = [];
let counter = 0;

import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return launch({
    chromeFlags: opts.chromeFlags,
  }).then((chrome) => {
    opts.port = chrome.port;

    return lighthouse(url, opts, config).then((results) => {
      // return chrome.kill().then(() => results.lhr);
      chrome.kill();

      return results.lhr;
    });
  });
}

function run(url, display, runs, callback) {
  const opts = {
    onlyCategories: ['performance'],
    chromeFlags: ['--ignore-certificate-errors'],
    blockedUrlPatterns: argv.block || [],
  };

  launchChromeAndRunLighthouse(url, opts).then((results) => {
    counter++;
    utils.pushDataAndDisplayScore(results, allResults, counter);
    console.log(`run ${counter}/${runs} ✅`);

    if (counter < runs) {
      run(url, display, runs, callback);
    } else {
      const medianData = utils.getMedianData(allResults);

      if (typeof callback === 'function') {
        callback(medianData, url);
      }
    }
  });
}

export function goLighthouse(url, display, runs) {
  run(url, display, runs, function (metrics, url) {
    console.log(`Median from ${counter} runs for ${url}`);
    utils.displayMedianData(metrics, display);
  });
}
