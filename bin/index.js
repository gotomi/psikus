#!/usr/bin/env node

import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

import prependHttp from 'prepend-http';
import { goLighthouse } from '../run-psi-lighthouse.js';
import { goPSIApi } from '../run-psi-api.js';

const runs = argv.runs || 3;
const display = argv.display || 'pretty';
const url = prependHttp(argv._[0]);
const local = argv.local || false;

if (local) {
  goLighthouse(url, display, runs);
} else {
  goPSIApi(url, display, runs);
}
