const scoreWeights = {
  v6: {
    FCP: 0.15,
    SI: 0.15,
    LCP: 0.25,
    TTI: 0.15,
    TBT: 0.25,
    CLS: 0.05,
  },
  v8: {
    FCP: 0.1,
    SI: 0.1,
    LCP: 0.25,
    TTI: 0.1,
    TBT: 0.3,
    CLS: 0.15,
  },
  v10: {
    FCP: 0.1,
    SI: 0.1,
    LCP: 0.25,
    TBT: 0.3,
    CLS: 0.25,
  },
};

function prepareData(version, metrics) {
  const lhVersion = version === 'v6' ? scoreWeights.v6 : scoreWeights.v8;

  let data = [];
  for (let [metric, weight] of Object.entries(lhVersion)) {
    if (!metrics[metric]) return [];
    data.push({
      id: metric,
      weight: weight,
      result: {
        score: metrics[metric].score,
      },
    });
  }

  return data;
}

function arithmeticMean(items) {
  items = items.filter((item) => item.weight > 0);

  const results = items.reduce(
    (result, item) => {
      const score = item.result.score;
      const weight = item.weight;

      return {
        weight: result.weight + weight,
        sum: result.sum + score * weight,
      };
    },
    {
      weight: 0,
      sum: 0,
    },
  );

  return results.sum / results.weight || 0;
}

function getScore(items) {
  if (!items.length) return 0;

  const score = arithmeticMean(items);

  return Math.round(score * 100);
}

export function calculatePSIScore(metrics) {
  const v6 = prepareData('v6', metrics);
  const v8 = prepareData('v8', metrics);
  const v10 = prepareData('v10', metrics);

  return {
    v6: getScore(v6),
    v8: getScore(v8),
    v10: getScore(v10),
  };
}
