'use strict';

const _ = require('lodash');

module.exports = (logSources, printer) => {
  let logSourcesMap = logSources.map((logSource) => {
    let value = logSource.pop();

    return {
      value,
      logSource,
    };
  });

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

  logSourcesMap = _.sortBy(logSourcesMap, 'value.date');

  while (logSourcesMap.length) {
    let logSource = logSourcesMap.shift();
    let log = logSource.value;

    logSource.value = logSource.logSource.pop();
    if (logSource.value) {
      logSourcesMap = insert(logSourcesMap, logSource);
    }

    printer.print(log);
  }

  printer.done();
};
