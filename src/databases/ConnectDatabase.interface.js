'use strict';

/**
 * Interface for classes that provide a connection to the database
 * @interface
 */
module.exports = class ConnectDatabase {
  setConfig(config) {
    throw new Error('Not implemented');
  }

  connect(config) {
    throw new Error('Not implemented');
  }

  get connection() {
    throw new Error('Not implemented');
  }
};
