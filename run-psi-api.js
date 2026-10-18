#!/usr/bin/env node

//https://developers.google.com/speed/docs/insights/v5/get-started

import utils from "./utils.js";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

import prependHttp from "prepend-http";

function validateConfig(params) {
  if (!params.url) {
    console.error("url is required");
    process.exit(1);
  } else {
    params.url = prependHttp(params.url);
  }

  if (!params.key) {
    console.warn("you have to provide API key");
  }
}

let allResults = [];
let counter = 0;

async function run(params, runs) {
  const url = setUpQuery(params);
  const response = await fetch(url);

  counter++;

  if (!response.ok) {
    console.log(
      `run ${counter}/${runs} ❌ HTTP ${response.status} ${response.statusText}`,
    );

    return;
  }

  const json = await response.json();

  if (json.error) {
    console.log(`run ${counter}/${runs} ❌ ${JSON.stringify(json.error)}`);

    return;
  }

  try {
    const results = json.lighthouseResult;

    utils.pushDataAndDisplayScore(results, allResults, counter, runs);
  } catch (e) {
    console.error(e);
  }
}

function setUpQuery(params) {
  const api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  let searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (params[key] === "") return;
    searchParams.append(key, params[key]);
  });

  let query = new URL(api);
  query.search = searchParams.toString();

  return query;
}

function generateTasks(params, runs) {
  let tasks = [];

  const urlObject = new URL(params.url);

  for (let i = 0; i < runs; i++) {
    let suffix = urlObject.search === "" ? "?" : "&";
    let cfg = Object.assign({}, params);
    cfg.url = `${params.url}${suffix}t=a${Math.floor(Math.random() * Date.now())}`;
    tasks.push(run(cfg, runs));
  }

  return tasks;
}

export function runPageSpeedApi(url, display, runs) {
  const params = {
    url: url,
    key: argv.key || "",
    strategy: argv.strategy || "mobile",
    locale: "en-GB",
  };

  validateConfig(params);

  const tasks = generateTasks(params, runs);

  Promise.all([...tasks])
    .then(() => {
      if (allResults.length === 0) {
        console.log("not enough data");
        process.exitCode = 1;

        return;
      }

      const medianData = utils.getMedianData(allResults);

      utils.displayMedianData(medianData, display);
    })
    .catch((e) => {
      console.error(`PSI API request failed: ${e.message || e}`);
      process.exitCode = 1;
    });
}
