const express = require('express');
const preferenceControllerFactory = require('../controllers/preferenceController');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * User Preferences Routing Configuration.
 * 
 * Securely routes configuration synchronization traffic to the 
 * preference management infrastructure.
 */
module.exports = (db) => {
  const router = express.Router();
  const preferenceController = preferenceControllerFactory(db);

  /**
   * Preferences Synchronization Endpoint.
   * 
   * Authenticated identities may push configuration updates via this 
   * deep-merge enabled interface.
   */
  router.post('/', requireAuth, preferenceController.updatePreferences);

  return router;
};
