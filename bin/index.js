#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const prependHttp = require('prepend-http');

const runs = argv.runs || 3;
const display = argv.display || 'pretty';
const url = prependHttp(argv._[0]);
const mode = argv.mode || 'api';


const lighthouse = require('../run-psi-lighthouse');
const psi = require('../run-psi-api');


mode === 'api' && psi.go(url, display, runs);
mode === 'lighthouse' && lighthouse.go(url, display, runs);