import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePSIScore } from "../psi-score.js";

const allMetrics = {
  FCP: { score: 1 },
  SI: { score: 1 },
  LCP: { score: 1 },
  TTI: { score: 1 },
  TBT: { score: 1 },
  CLS: { score: 1 },
};

test("all metric scores of 1 give 100 for every Lighthouse version", () => {
  assert.deepEqual(calculatePSIScore(allMetrics), {
    v6: 100,
    v8: 100,
    v10: 100,
  });
});

test("a perfect FCP with the rest at 0 weights FCP per version", () => {
  const metrics = {
    ...allMetrics,
    FCP: { score: 1 },
    SI: { score: 0 },
    LCP: { score: 0 },
    TTI: { score: 0 },
    TBT: { score: 0 },
    CLS: { score: 0 },
  };

  assert.deepEqual(calculatePSIScore(metrics), { v6: 15, v8: 10, v10: 10 });
});

test("a missing metric zeroes out only the versions that require it", () => {
  const metrics = { ...allMetrics };
  delete metrics.TTI;

  assert.deepEqual(calculatePSIScore(metrics), { v6: 0, v8: 0, v10: 100 });
});

test("no metrics at all zeroes out every version", () => {
  assert.deepEqual(calculatePSIScore({}), { v6: 0, v8: 0, v10: 0 });
});
