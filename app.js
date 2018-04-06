'use strict';

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const express = require('express');
const app = express();
const fs = require('fs');
const config = require('config');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const YAML = require('yamljs');

module.exports = { app };

const { appMongodb } = require('./src/databases');
const appMongodbConn = appMongodb.connect();

const { swaggerMiddleware, headersMiddleware } = require('./src/middlewares');
const {
  passportStrategiesService,
  logDebugService,
  logService,
  corsService
} = require('./src/services');
const { logger } = logService;
const routes = require('./src/routes');
const swaggerConfig = YAML.load('./src/api/swagger/swagger.yaml');

app.use(corsService.corsBase());
app.use(headersMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(methodOverride());

if (config.get('app.session.enable')) {
  app.use(
    session({
      secret: config.get('app.session.secret'),
      name: config.get('app.session.name'),
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: appMongodbConn })
    })
  );
}

const passport = passportStrategiesService.initPassportStrategies();

app.use(passport.initialize());

if (config.get('app.session.enable')) {
  app.use(passport.session());
}

if (
  config.has('logDebug.enableServerStream') &&
  config.get('logDebug.enableServerStream')
) {
  app.use(
    morgan('combined', {
      stream: { write: msg => logDebugService.debug(msg) }
    })
  );
}

app.use('/', routes);

if (
  config.has('app.publicDirs') &&
  Array.isArray(config.get('app.publicDirs'))
) {
  config.get('app.publicDirs').forEach(path => {
    try {
      fs.statSync(path);
      app.use(express.static(path));
    } catch (err) {
      logger.error('Found %s at %s', 'error', err);
    }
  });
}

swaggerTools.initializeMiddleware(swaggerConfig, swaggerMiddleware);
