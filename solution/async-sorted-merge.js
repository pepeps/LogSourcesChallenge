'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  const insert = (logSourcesMap, insertLogSource) => {
    if (insertLogSource.value.date >= _.last(logSourcesMap).value.date) {
      logSourcesMap.push(insertLogSource);

      return logSourcesMap;
    }

    logSourcesMap.some((logSource, index) => {
      if (insertLogSource.value.date < logSource.value.date) {
        logSourcesMap.splice(index, 0, insertLogSource);

        return true;
      }

      return false;
    });

    return logSourcesMap;
  };
  return Promise.map(logSources, (logSource) => {
    return logSource.popAsync().then((value) => {
      return {
        value,
        logSource,
      };
    });
  })
    .then((logSourcesMap) => {
      logSourcesMap = _.sortBy(logSourcesMap, 'value.date');

      return (function loop(logSourcesMap) {
        if (logSourcesMap.length) {
          let logSource = logSourcesMap.shift();
          let log = logSource.value;
          printer.print(log);
          return logSource.logSource.popAsync().then((value) => {
            logSource.value = value;

            if (value) {
              logSourcesMap = insert(logSourcesMap, logSource);
            }

            return loop(logSourcesMap);
          });
        }

        return Promise.resolve();
      })(logSourcesMap);
    })
    .then(() => printer.done());
};
