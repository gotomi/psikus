#!/usr/bin/env node

import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

import prependHttp from "prepend-http";
import { runLighthouse } from "../run-psi-lighthouse.js";
import { runPageSpeedApi } from "../run-psi-api.js";

const usage = `Usage: psikus <url> [options]

Options:
  --runs <number>     number of test runs (default: 3)
  --display <format>  output format: pretty or json (default: pretty)
  --local             run Lighthouse locally instead of the PSI API
  --strategy <name>   mobile or desktop (PSI API only, default: mobile)
  --block <patterns>  comma-separated URL patterns to block (local only)
  --key <key>         PageSpeed Insights API key
  --label <label>     add a label to results`;

if (argv.help || argv.h) {
  console.log(usage);
  process.exit(0);
}

if (!argv._[0]) {
  console.error("url is required");
  console.error(usage);
  process.exit(1);
}

const runs = argv.runs || 3;
const display = argv.display || "pretty";
const url = prependHttp(argv._[0]);
const local = argv.local || false;

if (local) {
  runLighthouse(url, display, runs);
} else {
  runPageSpeedApi(url, display, runs);
}
