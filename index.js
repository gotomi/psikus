#!/usr/bin/env node

//https://developers.google.com/speed/docs/insights/v5/get-started

let resource = [];
let audits = {};

const fetch = require('node-fetch');
const argv = require('minimist')(process.argv.slice(2));
const EventEmitter = require('events');
const emitter = new EventEmitter();
const prependHttp = require('prepend-http');



const { median } = require('./lib/stat.js')


let results = [];

async function run(params) {


    const url = setUpQuery(params);
    const response = await fetch(url)
    const json = await response.json();



    if (json.error) {
        console.log(json.error.code)
        return;
    }

    try {
        psiScore = json.lighthouseResult.categories.performance.score;
        resource = json.lighthouseResult.audits["resource-summary"].details.items;
        domSize = json.lighthouseResult.audits["dom-size"].displayValue;
        audits = json.lighthouseResult.audits;
        screenshots = json.lighthouseResult.audits["screenshot-thumbnails"];

        emitter.emit('psi', `${psiScore}`);

        let onerun = {
            psi: psiScore,
            breakdown: prepareResource(resource),
            metrics: prepareMetrics(audits),
            dom: domSize,
            //tmb: JSON.stringify(screenshots)
        }

        results.push(onerun);

    } catch (e) {
        console.log(e)
    }


}

function prepareMetrics(data) {
    let metrics = ["max-potential-fid",
        "interactive",
        "speed-index",
        "first-cpu-idle",
        "first-contentful-paint",
        "first-meaningful-paint"
    ];

    let filteredMetrics = {};
    metrics.forEach(item => {
        filteredMetrics[item] = data[item].displayValue
    })
    return filteredMetrics;
}


function prepareResource(data) {
    let breakdown = {};
    data.forEach(item => {
        breakdown[item.resourceType] = { requests: item.requestCount, bytes: item.size }
    });
    return breakdown;
}


//config
const runs = argv.runs || 3;

const params = {
    url: argv._[0],
    key: argv.key || '',
    strategy: argv.strategy || 'mobile',
    locale: 'en-UK'
}



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


function setUpQuery(params) {

    const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';


    let searchParams = new URLSearchParams();

    Object.keys(params).forEach((key, index) => {
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

        tasks.push(run(cfg));
    }
    return tasks;
}








validateConfig(params);


const tasks = generateTasks(params, runs);

Promise.all([...tasks]).then(() => {


    if (results.length % 2 === 0) results.pop(); // for the sake of simplicity - make sure it's an odd number 
    const psiData = results.map(item => item.psi)
    const medianPSI = median([...psiData]);
    let medianData = results.filter(item => item.psi === medianPSI)[0];
    if (medianData.psi) { medianData.time = Date.now(); }

    console.log(`PSI median from ${results.length} runs: `, medianPSI);
    console.dir(JSON.stringify(medianData));
});

emitter.on('psi', (message) => console.log('PSI received: ', message))
console.log('PSI for ', params.url);