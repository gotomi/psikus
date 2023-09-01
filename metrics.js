import fs from 'fs';

const getLighthouseData = function (results) {
  fs.writeFileSync('results.json', JSON.stringify(results));

  const psiScore = results.categories.performance.score;
  const requests = results.audits['network-requests'].details.items.filter((it) => it.statusCode !== -1);
  const domSize = results.audits['dom-size'].numericValue;
  const audits = results.audits;
  const screenshot = results.audits['final-screenshot'].details.data;
  const fetchTime = results.fetchTime;
  const url = results.requestedUrl;
  const onerun = {
    psi: psiScore,
    metrics: prepareMetrics(audits, metricsShort),
    dom: domSize,
    screenshot,
    fetchTime: fetchTime,
    url: url,
    requests: groupRequests(requests),
    // requests: requests,
    // resource: resource
  };

  return onerun;
};
const metricsShort = {
  FCP: 'first-contentful-paint',
  LCP: 'largest-contentful-paint',
  FMP: 'first-meaningful-paint',
  SI: 'speed-index',
  TBT: 'total-blocking-time',
  CLS: 'cumulative-layout-shift',
  FCI: 'first-cpu-idle',
  TTI: 'interactive',
};

// TMP

function isFirstParty(host, list) {
  let isFirst = false;
  list.forEach((item) => {
    isFirst = host.endsWith(item) || isFirst;
  });

  return isFirst;
}

function groupRequests(requests) {
  let firstPartyDomain = [];

  let hosts = {};
  let br = {};
  let summary = {};
  requests.forEach((item, index) => {
    const host = new URL(item.url).host;

    if (index === 0) {
      firstPartyDomain.push(host);
    }

    if (!hosts[host]) {
      hosts[host] = {
        requests: 1,
        firstParty: isFirstParty(host, firstPartyDomain),
        transferSize: item.transferSize,
        resourceSize: item.resourceSize,
      };
    } else {
      (hosts[host].requests += 1),
        (hosts[host].transferSize += item.transferSize),
        (hosts[host].resourceSize += item.resourceSize);
    }

    const rt = item.resourceType;

    if (!br[rt]) {
      br[rt] = {
        requests: 1,
        transferSize: item.transferSize,
        resourceSize: item.resourceSize,
      };
    } else {
      br[rt].requests += 1;
      (br[rt].transferSize += item.transferSize), (br[rt].resourceSize += item.resourceSize);
    }
  });

  const thirdPartyList = Object.values(hosts).filter((item) => !item.firstParty);
  const firstPartyList = Object.values(hosts).filter((item) => item.firstParty);

  summary = {
    thirdParty: thirdPartyList.map((item) => item.requests).reduce((a, b) => a + b, 0),

    firstParty: firstPartyList.map((item) => item.requests).reduce((a, b) => a + b, 0),
    total: Object.values(hosts)
      .map((item) => item.requests)
      .reduce((a, b) => a + b, 0),
  };

  return {
    br: br,
    hosts: hosts,
    summary: summary,
  };
}

// TMP

function prepareMetrics(data, metricsShort) {
  const filteredMetrics = {};

  for (let [key, value] of Object.entries(metricsShort)) {
    if (data[value]) {
      const metricValue =
        data[value].numericUnit == 'millisecond' ? Math.floor(data[value].numericValue) : data[value].numericValue;

      filteredMetrics[key] = {
        score: data[value].score,
        value: metricValue,
        title: data[value].title,
      };
    }
  }

  return filteredMetrics;
}

export default {
  getLighthouseData,
};
