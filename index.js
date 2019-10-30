#!/usr/bin/env node

//https://developers.google.com/speed/docs/insights/v5/get-started

let resource = [];
let audits = {};

const fetch = require('node-fetch');
const argv = require('minimist')(process.argv.slice(2));
const EventEmitter = require('events');
const emitter = new EventEmitter();

const { median } = require('./lib/stat.js')


let results = [];

async function run(config) {


    const url = setUpQuery(config);
    const response = await fetch(url)
    const json = await response.json();



    if (json.error) {
        console.log(json.error)
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
            rs: prepareResource(resource),
            m: prepareMetrics(audits),
            ds: domSize,
            // tmb: screenshots
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
    let rs = {};
    data.forEach(item => {
        rs[item.resourceType] = { reqs: item.requestCount, size: item.size }
    });
    return rs;
}


//config
const runs = argv.runs || 3;

const config = {
    url: argv._[0],
    key: argv.key,
    strategy: 'mobile',
    locale: 'en-UK'
}



function validateConfig(config) {
    if (!config.url) {
        console.error('url is required');
        process.exit(1);
    }
    if (!config.key) {
        console.warn('you should provide API key');

    }
}


function setUpQuery(config) {

    const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const parameters = config;

    let params = new URLSearchParams();

    Object.keys(parameters).forEach((key, index) => {
        params.append(key, parameters[key])
    });

    let query = new URL(api);
    query.search = params.toString();
    return query;
}








function generateTasks(config, runs) {
    let tasks = [];
    const urlObject = new URL(config.url);
    for (let i = 0; i < runs; i++) {

        let suffix = urlObject.search === '' ? '?' : '&';
        let cfg = Object.assign({}, config);
        cfg.url = `${config.url}${suffix}t=a${Math.random() * Date.now()}`
        console.log(cfg);
        tasks.push(run(cfg));
    }
    return tasks;
}








validateConfig(config);


const tasks = generateTasks(config, runs);

Promise.all([...tasks]).then(() => {


    if (results.length % 2 === 0) results.pop(); // for the sake of simplicity - make sure it's an odd number 
    const psiData = results.map(item => item.psi)
    const medianPSI = median([...psiData]);
    let medianData = {}
    medianData = results.filter(item => item.psi === medianPSI)[0];
    medianData.date = Date.now();

    console.log(`PSI median from ${results.length} runs: `, medianPSI);
    console.dir(medianData);
});

emitter.on('psi', (message) => console.log('PSI received: ', message))
console.log('PSI for ', config.url);