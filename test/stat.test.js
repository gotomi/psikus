import { test } from "node:test";
import assert from "node:assert/strict";
import stat from "../lib/stat.js";

test("median of an odd-length list", () => {
  assert.equal(stat.median([3, 1, 2]), 2);
});

test("median of an even-length list averages the two middle values", () => {
  assert.equal(stat.median([4, 1, 3, 2]), 2.5);
});

test("median of a single value", () => {
  assert.equal(stat.median([7]), 7);
});

test("median of an empty list", () => {
  assert.equal(stat.median([]), 0);
});

test("median does not mutate the input", () => {
  const values = [3, 1, 2];

  stat.median(values);

  assert.deepEqual(values, [3, 1, 2]);
});
