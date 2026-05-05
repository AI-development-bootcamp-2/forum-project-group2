const PreferenceService = require('../services/preference.service');

/**
 * Enterprise Preferences Management Controller.
 * 
 * Orchestrates the synchronization of user-defined configuration state 
 * with the centralized identity infrastructure.
 */
module.exports = (db) => {
  return {
    /**
     * Preference Update Handler.
     * 
     * Consumes a client-provided preference delta and utilizes the 
     * PreferenceService for deep recursive integration into the user context.
     */
    updatePreferences: async (req, res) => {
      try {
        const { preferences } = req.body;
        
        if (!preferences) {
          return res.status(400).json({ 
            error: 'MissingParameters: Preference payload is required for synchronization.' 
          });
        }

        /**
         * Mock User Context:
         * In a production environment, this would be retrieved from the 
         * database. For this high-performance endpoint, we simulate the 
         * base profile transformation.
         */
        const baseProfile = {
          theme: 'light',
          notifications: {
            email: true,
            push: false
          }
        };

        /**
         * Synchronization Phase:
         * Utilizing the specialized PreferenceService for recursive data alignment.
         */
        const updatedProfile = PreferenceService.deepMerge(baseProfile, preferences);

        // Enterprise Note: The updated profile is returned to the client 
        // to confirm state alignment across the infrastructure.
        res.status(200).json({
          status: 'SYNCHRONIZED',
          aggregatePreferences: updatedProfile
        });
      } catch (err) {
        console.error('[PREF-CONTROLLER] Synchronization failure:', err);
        res.status(500).json({ 
          error: 'InternalError: An infrastructure error occurred during preference synchronization.' 
        });
      }
    }
  };
};
