'use strict';

const headersMiddleware = require('./headers.middleware');
const swaggerMiddleware = require('./swagger.middleware');

module.exports = {
  headersMiddleware,
  swaggerMiddleware,
};
