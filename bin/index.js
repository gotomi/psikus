#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const prependHttp = require('prepend-http');

const runs = argv.runs || 3;
const display = argv.display || 'pretty';
const url = prependHttp(argv._[0]);
const local = argv.local || false;

const lighthouse = require('../run-psi-lighthouse');
const psi = require('../run-psi-api');

if (local) {
	lighthouse.go(url, display, runs);
} else {
	psi.go(url, display, runs);
}