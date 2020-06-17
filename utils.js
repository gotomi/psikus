const argv = require('minimist')(process.argv.slice(2));
const psiScore = require('./psi-score');
const lighthouseData = require('./metrics');
const {
    median
} = require('./lib/stat.js')



function pushDataAndDisplayScore(results, allResults, counter) {

    const LH = lighthouseData.getLighthouseData(results);
    LH.label = argv.label || '';  //todo
    LH.score = psiScore.calculatePSIScore(LH.metrics);

    allResults.push(LH);
    // console.log(`Run ${counter}:  ${JSON.stringify(LH.score)}`);
}

function getMedianData(allResults) {
    const psiData = allResults.map(item => item.psi)
    const medianPSI = median([...psiData]);
    return medianData = allResults.filter(item => item.psi === medianPSI)[0];
}

function displayMedianData(medianData, display) {
    if (display == "pretty") {
        console.table(medianData.score);
        console.table(medianData.metrics);
        // console.table(medianData.breakdown);
        // console.table(medianData.requests);
        console.log('fetchTime:', medianData.fetchTime);
        console.log('DOM: ', medianData.dom);

        console.table(medianData.requests.br)
        console.table(medianData.requests.hosts)
        console.table(medianData.requests.summary)

        // const fs = require('fs');
        // fs.writeFile(`./${medianData.label}-${medianData.fetchTime}.json`, JSON.stringify(medianData), 'utf8', function(){
        // });

        console.log();
    } else {
        console.log(JSON.stringify(medianData));
    }
}

module.exports = {
    pushDataAndDisplayScore,
    getMedianData,
    displayMedianData
}