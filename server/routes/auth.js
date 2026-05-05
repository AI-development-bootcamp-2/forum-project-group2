const express = require('express');
const { auditLogger } = require('../middleware/logger.middleware');
const authControllerFactory = require('../controllers/authController');

/**
 * Authentication Route Configuration.
 * Routes traffic to the auth controller with audit logging enabled.
 */
module.exports = (db) => {
  const router = express.Router();
  const authController = authControllerFactory(db);

  // Apply audit logging to all auth transactions
  router.use(auditLogger);

  // Identity Registration
  router.post('/register', authController.register);

  // Identity Verification
  router.post('/login', authController.login);

  return router;
};
