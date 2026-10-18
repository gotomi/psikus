import utils from "./utils.js";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

let allResults = [];
let counter = 0;

import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

async function launchChromeAndRunLighthouse(url, opts, config = null) {
  const chrome = await launch({
    chromeFlags: opts.chromeFlags,
  });

  try {
    opts.port = chrome.port;
    const results = await lighthouse(url, opts, config);

    return results.lhr;
  } finally {
    await chrome.kill();
  }
}

function run(url, display, runs, callback) {
  const opts = {
    onlyCategories: ["performance"],
    chromeFlags: ["--headless", "--ignore-certificate-errors"],
    blockedUrlPatterns: argv.block
      ? [].concat(argv.block).flatMap((pattern) => pattern.split(","))
      : [],
  };

  launchChromeAndRunLighthouse(url, opts)
    .then((results) => {
      counter++;
      utils.pushDataAndDisplayScore(results, allResults, counter, runs);

      if (counter < runs) {
        run(url, display, runs, callback);
      } else if (allResults.length > 0) {
        callback(utils.getMedianData(allResults), url);
      } else {
        console.log("not enough data");
      }
    })
    .catch((e) => {
      console.error(`run ${counter + 1}/${runs} failed: ${e.message || e}`);
      process.exitCode = 1;
    });
}

export function runLighthouse(url, display, runs) {
  run(url, display, runs, function (metrics, url) {
    console.log(`Median from ${counter} runs for ${url}`);
    utils.displayMedianData(metrics, display);
  });
}
