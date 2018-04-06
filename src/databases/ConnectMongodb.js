'use strict';

const ConnectDatabase = require('./ConnectDatabase.interface');
const config = require('config');
const mongoose = require('mongoose');
const { logger } = require('../services/log.service');

mongoose.Promise = Promise;

/**
 * Сlass that provides a connection to the Mongo database
 * @class
 * @implements {ConnectDatabase}
 */
module.exports = class ConnectMongodb extends ConnectDatabase {
  constructor() {
    super();
    this._connection = null;
    this._isConnectedBefore = false;
    this._config = {};
    this._logURI = null;
  }

  _connect({ host, port, dbName, user, password }) {
    const auth = user && password ? `${user}:${password}@` : '';
    const dbURI = `mongodb://${auth}${host}:${port}/${dbName}`;
    this._logURI = `mongodb://${host}:${port}/${dbName}`;
    this._connection = mongoose.createConnection(dbURI, {
      auto_reconnect: true
    });
  }

  setConfig(config) {
    this._config = config;
  }

  connect(config = this._config) {
    if (this._connection !== null) {
      return;
    }

    const reconnectTimeout =
      typeof config.reconnectTimeout !== 'undefined'
        ? config.reconnectTimeout
        : 5000;

    this._connect({ ...config });

    this._connection.on('connecting', () => {
      logger.debug(`Connecting to ${this._logURI}`);
    });

    this._connection.on('error', err => {
      logger.error(
        `${this._logURI} connection error. Found %s at %s`,
        'error',
        err
      );
      mongoose.disconnect();
    });

    this._connection.on('connected', () => {
      this._isConnectedBefore = true;
      logger.debug(`Connected to ${this._logURI}`);
    });

    this._connection.once('open', () => {
      logger.debug(`${this._logURI} connection opened`);
    });

    this._connection.on('reconnected', () => {
      logger.debug(`${this._logURI} reconnected`);
    });

    this._connection.on('disconnected', () => {
      logger.debug(`${this._logURI} disconnected`);

      if (!this._isConnectedBefore) {
        logger.error(
          `${this._logURI} disconnected. Reconnecting in ${reconnectTimeout /
            1000}s...`
        );
        setTimeout(() => this._connect(), reconnectTimeout);
      }
    });

    // Close the Mongoose connection, when receiving SIGINT or SIGHUP
    process.on('SIGINT', () => this.processExit());
    process.on('SIGHUP', () => this.processExit());

    return this._connection;
  }

  processExit() {
    this._connection.close(() => {
      logger.debug(`Force to close the ${this._logURI} conection`);
      process.exit(0);
    });
  }

  getNativeConnection() {
    return new Promise((resolve, reject) => {
      if (this.connection.readyState !== 1) {
        this.connection.then(resolve).catch(reject);
      } else {
        resolve(this.connection.db);
      }
    });
  }

  get connection() {
    if (this._connection === null) {
      this.connect();
    }

    return this._connection;
  }
};
