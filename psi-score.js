const scoreWeights = {
  v6: {
    FCP: 0.15,
    SI: 0.15,
    LCP: 0.25,
    TTI: 0.15,
    TBT: 0.25,
    CLS: 0.05
  },
  v5: {
    FCP: 0.2,
    SI: 0.26666,
    FMP: 0.066666,
    TTI: 0.33333,
    FCI: 0.133333
  }
}

function prepareData(version, metrics) {
  const lhVersion = (version === 'v5') ? scoreWeights.v5 : scoreWeights.v6
  let data = [];

  for (let [metric, weight] of Object.entries(lhVersion)) {
    if (!metrics[metric]) return [];
    data.push({
      id: metric,
      weight: weight,
      result: {
        score: metrics[metric].score
      }
    })
  }
  return data;
}



function arithmeticMean(items) {
  items = items.filter(item => item.weight > 0);
  const results = items.reduce(
    (result, item) => {
      const score = item.result.score;
      const weight = item.weight;
      return {
        weight: result.weight + weight,
        sum: result.sum + score * weight,
      };
    }, {
      weight: 0,
      sum: 0
    }
  );
  return results.sum / results.weight || 0;
}


function getScore(items) {
  if (!items.length) return 0;
  const score = arithmeticMean(items)
  return Math.round(score * 100);
}

function calculatePSIScore(metrics) {
  const v5 = prepareData('v5', metrics);
  const v6 = prepareData('v6', metrics);
  return {
    v5 :getScore(v5),
    v6 :getScore(v6)
  }
}

module.exports = {
  calculatePSIScore
};