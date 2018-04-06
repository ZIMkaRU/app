'use strict';

const express = require('express');

const { logService, helpers } = require('../services');
const { logger } = logService;
const { responses } = helpers;
const controllers = require('../controllers');

const router = express.Router();
const { authController } = controllers;

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/user', authController.getUserSession);

router.use((err, req, res, next) => {
  logger.error('~~~ Unexpected error exception start ~~~');
  // logger.error("Request: %s", req);
  logger.error('Found %s at %s', 'error', err);
  logger.error('~~~ Unexpected error exception end ~~~');

  return responses.failureError(500, err, res);
});

module.exports = router;
