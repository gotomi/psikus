import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

import { calculatePSIScore } from "./psi-score.js";
import lighthouseData from "./metrics.js";
import stat from "./lib/stat.js";

function pushDataAndDisplayScore(results, allResults, counter, runs) {
  const LH = lighthouseData.getLighthouseData(results);

  LH.label = argv.label || ""; //todo
  LH.score = calculatePSIScore(LH.metrics);

  allResults.push(LH);

  console.log(
    ` ✅ run ${counter}/${runs} - PSI score: ${JSON.stringify(LH.score.v10)}`,
  );
}

function getMedianData(allResults) {
  const psiData = allResults.map((item) => item.psi);
  const medianPSI = stat.median([...psiData]);

  return allResults.filter((item) => item.psi === medianPSI)[0];
}

function displayMedianData(medianData, display) {
  if (display == "pretty") {
    console.table(medianData.score);
    console.table(medianData.metrics);
    // console.table(medianData.requests);
    console.log("fetchTime:", medianData.fetchTime);
    console.log("DOM: ", medianData.dom);

    console.table(medianData.requests.br);
    console.table(medianData.requests.hosts);
    console.table(medianData.requests.summary);

    // const fs = require('fs');
    // fs.writeFile(`./${medianData.label}-${medianData.fetchTime}.json`, JSON.stringify(medianData), 'utf8', function(){
    // });

    console.log();
  } else {
    console.log(JSON.stringify(medianData, null, 2));
  }
}

export default { pushDataAndDisplayScore, getMedianData, displayMedianData };
