import { test } from "node:test";
import assert from "node:assert/strict";
import lighthouseData from "../metrics.js";

const metricAudit = (numericValue) => ({
  score: 0.5,
  numericValue,
  numericUnit: "millisecond",
  title: "metric",
});

const lhr = {
  categories: { performance: { score: 0.42 } },
  fetchTime: "2026-10-18T12:00:00.000Z",
  requestedUrl: "https://example.com/",
  audits: {
    "network-requests": {
      details: {
        items: [
          {
            url: "https://example.com/",
            statusCode: 200,
            resourceType: "Document",
            transferSize: 100,
            resourceSize: 200,
          },
          {
            url: "https://cdn.example.com/a.js",
            statusCode: 200,
            resourceType: "Script",
            transferSize: 10,
            resourceSize: 20,
          },
          {
            url: "https://tracker.test/b.js",
            statusCode: -1,
            resourceType: "Script",
            transferSize: 99,
            resourceSize: 99,
          },
        ],
      },
    },
    "dom-size-insight": { numericValue: 42 },
    "final-screenshot": { details: { data: "screenshot-base64" } },
    "first-contentful-paint": metricAudit(1234.6),
    "largest-contentful-paint": metricAudit(2500),
    "speed-index": metricAudit(3000),
    "total-blocking-time": metricAudit(150),
    "cumulative-layout-shift": {
      score: 0.5,
      numericValue: 0.05,
      numericUnit: "unitless",
      title: "metric",
    },
    interactive: metricAudit(3500),
  },
};

test("extracts the top-level Lighthouse data", () => {
  const data = lighthouseData.getLighthouseData(lhr);

  assert.equal(data.psi, 0.42);
  assert.equal(data.dom, 42);
  assert.equal(data.screenshot, "screenshot-base64");
  assert.equal(data.fetchTime, "2026-10-18T12:00:00.000Z");
  assert.equal(data.url, "https://example.com/");
});

test("extracts metrics, flooring millisecond values", () => {
  const data = lighthouseData.getLighthouseData(lhr);

  assert.equal(data.metrics.FCP.value, 1234);
  assert.equal(data.metrics.LCP.value, 2500);
  assert.equal(data.metrics.CLS.value, 0.05);
  assert.equal(data.metrics.FCP.score, 0.5);
});

test("groups requests by host and marks first-party hosts", () => {
  const data = lighthouseData.getLighthouseData(lhr);

  assert.deepEqual(data.requests.summary, {
    firstParty: 2,
    thirdParty: 0,
    total: 2,
  });
  assert.deepEqual(data.requests.hosts["example.com"], {
    requests: 1,
    firstParty: true,
    transferSize: 100,
    resourceSize: 200,
  });
  assert.deepEqual(data.requests.hosts["cdn.example.com"], {
    requests: 1,
    firstParty: true,
    transferSize: 10,
    resourceSize: 20,
  });
});

test("aggregates requests by resource type", () => {
  const data = lighthouseData.getLighthouseData(lhr);

  assert.deepEqual(data.requests.br.Script, {
    requests: 1,
    transferSize: 10,
    resourceSize: 20,
  });
});
