#!/usr/bin/env node

//https://developers.google.com/speed/docs/insights/v5/get-started

const psiScore = require('./psi-score');
const lighthouseData = require('./metrics');
const utils = require('./utils');

const fetch = require('node-fetch');
const argv = require('minimist')(process.argv.slice(2));
const prependHttp = require('prepend-http');
const fs = require('fs');
const {
    median
} = require('./lib/stat.js')



//config
// const runs = argv.runs || 3;
// const display = argv.display || 'pretty';
// const url = argv._[0];



function validateConfig(params) {
    if (!params.url) {
        console.error('url is required');
        process.exit(1);
    } else {
        params.url = prependHttp(params.url);
    }
    if (!params.key) {
        console.warn('you should provide API key');

    }
}



let allResults = [];
let counter = 0;

async function run(params, runs) {

    const url = setUpQuery(params);
    const response = await fetch(url)
    const json = await response.json();
    counter++;
    if (json.error) {
        console.log(`run ${counter}/${runs} ❌ ${JSON.stringify(json.error)}`);

        return;
    }

    try {
        const results = json.lighthouseResult;
        
        utils.pushDataAndDisplayScore(results, allResults, counter);
        console.log(`run ${counter}/${runs} ✅`);

    } catch (e) {

        console.log(e)
    }

}


function setUpQuery(params) {
    const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

    let searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
        if (params[key] === '') return;
        searchParams.append(key, params[key])
    });

    let query = new URL(api);
    query.search = searchParams.toString();
    return query;
}



function generateTasks(params, runs) {
    let tasks = [];
    const urlObject = new URL(params.url);
    for (let i = 0; i < runs; i++) {

        let suffix = urlObject.search === '' ? '?' : '&';
        let cfg = Object.assign({}, params);
        cfg.url = `${params.url}${suffix}t=a${Math.random() * Date.now()}`
        tasks.push(run(cfg, runs));
    }
    return tasks;
}


function go(url, display, runs) {
    const params = {
        url: url,
        key: argv.key || '',
        strategy: argv.strategy || 'mobile',
        locale: 'en-UK'
    }

    validateConfig(params);
    const tasks = generateTasks(params, runs);

    Promise.all([...tasks]).then(() => {
       if(allResults.length === 0) {console.log('not enough data'); return} 
        const medianData = utils.getMedianData(allResults);
        utils.displayMedianData(medianData, display)

    });
}

module.exports = {
    go
}