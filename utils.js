const psiScore = require('./psi-score');
const lighthouseData = require('./metrics');
const {
    median
} = require('./lib/stat.js')



function pushDataAndDisplayScore(results, allResults, counter) {
    const LH = lighthouseData.getLighthouseData(results);
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
        console.table(medianData.breakdown);
        console.log('fetchTime:', medianData.fetchTime);
        console.log('DOM: ', medianData.dom);
    } else {
        console.log(medianData);
    }
}

module.exports = {
    pushDataAndDisplayScore,
    getMedianData,
    displayMedianData
}