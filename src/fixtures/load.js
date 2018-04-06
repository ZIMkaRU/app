'use strict';

process.env['NODE_CONFIG_DIR'] = '../../config';

const { appMongodb } = require('../databases');
const appMongodbConn = appMongodb.connect();
const args = process.argv.slice(2);
const { CustomLogger } = require('../services').logService;
const userService = require('../api/services/user.service');
const users = require('./users/users.json');

let count = 0;

const logger = new CustomLogger({
  label: ':load-fixtures',
  enableColor: true,
  enableConsole: true
}).createLogger();

const testArg = arg => {
  return args.some(item => item === arg);
};

const runner = async (
  collection,
  removeCallback,
  createCallback,
  nameForLog = ''
) => {
  try {
    if (typeof removeCallback === 'function') {
      await removeCallback();
    } else {
      logger.warn(
        `The function for removing the "${nameForLog}" entity is not defined`
      );
    }

    if (typeof createCallback === 'function') {
      const promiseArr = collection.map(item => createCallback(item));

      await Promise.all(promiseArr);

      count += 1;
    } else {
      logger.warn(
        `The function for creating the "${nameForLog}" entity is not defined`
      );
    }

    logger.info(`Loading of the "${nameForLog}" entity is complete`);
  } catch (err) {
    logger.error(`Failed to load "${nameForLog}"`);
    logger.error('Found %s at %s', 'error', err);
  }
};

(async () => {
  await appMongodbConn;

  if (args.length === 0 || testArg('--all') || testArg('users')) {
    await runner(
      users,
      userService.deleteUsers,
      userService.createUser,
      'users'
    );
  }

  logger.info(`Loaded ${count} collection${count === 1 ? '' : 's'}`);

  await appMongodbConn.close();

  process.nextTick(() => process.exit(0));
})();
