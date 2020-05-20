const psiScore = require('./psi-score');
const lighthouseData = require('./metrics');
const utils = require('./utils');

const argv = require('minimist')(process.argv.slice(2));
const prependHttp = require('prepend-http');
const fs = require('fs');
const {
  median
} = require('./lib/stat.js')



let allResults = [];
let counter = 0;

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({
    chromeFlags: opts.chromeFlags
  }).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      return chrome.kill().then(() => results.lhr)
    });
  });
}

function run(url, display, runs, callback) {
  const opts = {
    onlyCategories: ['performance'],
    chromeFlags: ['--headless'],
    blockedUrlPatterns: argv.block || []
  };
  launchChromeAndRunLighthouse(url, opts).then(results => {
    counter++;
    utils.pushDataAndDisplayScore(results, allResults, counter);
    console.log(`run ${counter}/${runs} ✅`);

    if (counter < runs) {
      run(url, display, runs, callback)
    } else {
      const medianData = utils.getMedianData(allResults);
      if (typeof callback === 'function') {
        callback(medianData, url)
      }
    }
  })
}



function go(url, display, runs) {
  run(url, display, runs, function(metrics, url) {
    console.log(`Median from ${counter} runs for ${url}`);
    utils.displayMedianData(metrics, display);
  })
}

module.exports = {
  go
}