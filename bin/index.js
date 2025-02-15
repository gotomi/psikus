#!/usr/bin/env node

import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

import prependHttp from "prepend-http";
import { runLighthouse } from "../run-psi-lighthouse.js";
import { runPageSpeedApi } from "../run-psi-api.js";

const runs = argv.runs || 3;
const display = argv.display || "pretty";
const url = prependHttp(argv._[0]);
const local = argv.local || false;

if (local) {
  runLighthouse(url, display, runs);
} else {
  runPageSpeedApi(url, display, runs);
}
