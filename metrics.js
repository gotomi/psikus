const getLighthouseData = function(results) {
    const psiScore = results.categories.performance.score;
    const resource = results.audits["resource-summary"].details.items;
    const requests = results.audits['network-requests'].details.items.filter(it => it.statusCode !== -1);
    const domSize = results.audits["dom-size"].numericValue;
    const audits = results.audits;
    const screenshot = results.audits["final-screenshot"].details.data;
    const fetchTime = results.fetchTime;
    const url = results.requestedUrl;

    const onerun = {
        psi: psiScore,
        breakdown: prepareResource(resource),
        metrics: prepareMetrics(audits, metricsShort),
        dom: domSize,
        // screenshot: screenshot,
        fetchTime: fetchTime,
        url: url,
        requests: groupRequests(requests)
        // requests: requests,
        // resource: resource

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

// TMP

function isFirstParty(host, list) {
    isFirst = false;
    list.forEach(item => {
        isFirst = host.endsWith(item) || isFirst
    })
    return isFirst;
}



function enrichRequests(requests, firstPartyDomainList) {

    requests.forEach((item, index) => {
        item.thirdParty = !isFirstParty(host, firstPartyDomain)
    })
}



function groupRequests(requests) {
    let firstPartyDomain = ['allegrostatic.com', 'allegroimg.com', 'ngacm.com', 'ngastatic.com'];


    let hosts = {};
    let br = {};
    let summary = {};
    requests.forEach((item, index) => {
        host = (new URL(item.url)).host;

        if (index === 0) {
            firstPartyDomain.push(host);
        }

        if (!hosts[host]) {
            hosts[host] = {
                requests: 1,
                firstParty: isFirstParty(host, firstPartyDomain),
                transferSize: item.transferSize,
                resourceSize: item.resourceSize

            }
        } else {
            hosts[host].requests += 1,
                hosts[host].transferSize += item.transferSize,
                hosts[host].resourceSize += item.resourceSize
        };


        const rt = item.resourceType;
        if (!br[rt]) {
            br[rt] = {
                requests: 1,
                transferSize: item.transferSize,
                resourceSize: item.resourceSize
            }
        } else {
            br[rt].requests += 1;
            br[rt].transferSize += item.transferSize,
                br[rt].resourceSize += item.resourceSize
        }
    })


    const thirdPartyList = Object.values(hosts).filter(item => !item.firstParty);
    const firstPartyList = Object.values(hosts).filter(item => item.firstParty);

    summary = {
        thirdParty: (thirdPartyList.length > 0) ? thirdPartyList.map(item => item.requests).reduce((a, b) => a + b) : 0,
        firstParty: Object.values(hosts).filter(item => item.firstParty).map(item => item.requests).reduce((a, b) => a + b),
        total: Object.values(hosts).map(item => item.requests).reduce((a, b) => a + b),
    }

    return {
        br: br,
        hosts: hosts,
        summary: summary
    }

}

// TMP



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



function prepareResource2(requests) {
    let br = {};

    requests.forEach(item => {
        rt = item.resourceType;
        if (!br[rt]) {
            br[rt] = {
                requestCount: 1,
                transferSize: item.transferSize,
                resourceSize: item.resourceSize
            }
        } else {
            br[rt].requestCount += 1;
            br[rt].transferSize += item.transferSize;
            br[rt].resourceSize += item.resourceSize
        }
    })
    return br;
}

function prepareResource(data) {
    let breakdown = {};
    data.forEach(item => {
        breakdown[item.resourceType] = {
            requests: item.requestCount,
            bytes: item.transferSize || item.size
        }
    });
    return breakdown;
}

module.exports = {
    getLighthouseData
}