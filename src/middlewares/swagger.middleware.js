'use strict';

const { app } = require('../../app');
const config = require('config');
const { authService, logService, helpers } = require('../services');
const { responses } = helpers;
const { logger } = logService;

const port = config.get('app.port');

module.exports = function(middleware) {
  app.use(middleware.swaggerMetadata()); // needs to go BEFORE swaggerSecurity

  app.use(
    middleware.swaggerSecurity({
      Bearer: authService.verifyToken
    })
  );

  app.use(
    middleware.swaggerValidator({
      validateResponse: false
    })
  );

  app.use(
    middleware.swaggerRouter({
      controllers: './src/api/controllers',
      useStubs: false
    })
  );

  app.use(
    middleware.swaggerUi({
      apiDocs: '/v1/schema',
      swaggerUi: '/v1/docs'
    })
  );

  app.use(function(err, req, res, next) {
    if (err.failedValidation) {
      const _response = Object.assign({ message: '' }, err.results);
      
      _response.message = err.message || err.statusMessage || '';
      responses.success(err.statusCode ? err.statusCode : 400, _response, res);
    } else next();
  });

  let server = app.listen(port, function() {
    let host = server.address().address;
    let port = server.address().port;

    logger.info(`Server listening on host ${host} port ${port}`);
  });
};
