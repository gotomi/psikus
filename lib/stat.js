export default {
  median: (values) => {
    if (values.length === 0) return 0;

    if (values.length % 2 === 0) values.pop(); // for the sake of simplicity - make sure the length is an odd number

    values.sort(function (a, b) {
      return a - b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2) return values[half];

    return (values[half - 1] + values[half]) / 2.0;
  },
};
