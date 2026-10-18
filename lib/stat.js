export default {
  median: (values) => {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);

    if (sorted.length % 2) return sorted[half];

    return (sorted[half - 1] + sorted[half]) / 2.0;
  },
};
