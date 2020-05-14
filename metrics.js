const getLighthouseData = function(results) {
    const psiScore = results.categories.performance.score;
    const resource = results.audits["resource-summary"].details.items;
    const domSize = results.audits["dom-size"].numericValue;
    const audits = results.audits;
    const screenshot = results.audits["final-screenshot"].details.data;
    const fetchTime = results.fetchTime;

    const onerun = {
        psi: psiScore,
        breakdown: prepareResource(resource),
        metrics: prepareMetrics(audits, metricsShort),
        dom: domSize,
        screenshot: screenshot,
        fetchTime: fetchTime
    }
    return onerun
}


const metricsShort = {
    FCP: 'first-contentful-paint',
    LCP: 'largest-contentful-paint',
    FMP: 'first-meaningful-paint',
    SI: 'speed-index',
    TBT: 'total-blocking-time',
    CLS: 'cumulative-layout-shift',
    FCI: 'first-cpu-idle',
    TTI: 'interactive'
}


function prepareMetrics(data, metricsShort) {
    const filteredMetrics = {};
    for (let [key, value] of Object.entries(metricsShort)) {
        if (data[value]) {
            const metricValue = (data[value].numericUnit == 'millisecond') ? Math.floor(data[value].numericValue) : data[value].numericValue
            filteredMetrics[key] = {
                score: data[value].score,
                value: metricValue,
                title: data[value].title
            }
        }
    }

    return filteredMetrics;
}


function prepareResource(data) {
    let breakdown = {};
    data.forEach(item => {
        breakdown[item.resourceType] = {
            requests: item.requestCount,
            bytes: item.size
        }
    });
    return breakdown;
}

module.exports = {
    getLighthouseData
}