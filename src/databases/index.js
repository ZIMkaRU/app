'use strict';

const fs = require('fs');
const config = require('config');
const { logger } = require('../services/log.service');

const databases = config.get('databases');
const moduleExports = {};

const formatName = function formatNameDB(str, sep) {
  return str
    .split(sep)
    .reduce(
      (prev, curr) => prev + curr.charAt(0).toUpperCase() + curr.slice(1)
    );
};

try {
  const fileNames = fs.readdirSync(__dirname);

  for (let name in databases) {
    if (!Object.prototype.hasOwnProperty.call(databases, name)) continue;
    if (fileNames.some(item => item === `${name}.js`)) {
      let _name = formatName(name, '.');
      _name = formatName(_name, '-');
      _name = formatName(_name, '_');
      moduleExports[_name] = require(`./${name}.js`);
      moduleExports[_name].setConfig({ ...databases[name] });
    }
  }
} catch (err) {
  logger.error('Found %s at %s', 'error', err);
  throw err;
}

module.exports = {
  ...moduleExports,
};
