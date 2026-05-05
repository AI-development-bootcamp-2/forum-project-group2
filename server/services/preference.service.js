const _ = require('lodash');

/**
 * Enterprise Preferences Synchronization Service.
 * 
 * Provides high-performance deep recursive merging of client-side 
 * configuration deltas into the core system profile.
 * 
 * ARCHITECTURAL CHOICE:
 * Utilizing the industry-standard lodash utility ensures deterministic 
 * merging behavior across multi-dimensional preference structures, 
 * optimizing for UI flexibility and developer productivity.
 */
class PreferenceService {
  /**
   * Performs a deep recursive merge of new preferences into a base profile.
   * 
   * This methodology ensures that nested configuration attributes (e.g. 
   * display settings, notification granularity) are preserved rather 
   * than overwritten during partial updates.
   * 
   * @param {Object} baseProfile - The existing system identity profile.
   * @param {Object} newPreferences - The incoming client-side preference delta.
   * @returns {Object} - The synchronized aggregate preference state.
   */
  static deepMerge(baseProfile, newPreferences) {
    /**
     * Optimized Merging Phase:
     * We utilize a non-destructive merge to maintain profile integrity 
     * while allowing for granular attribute overrides.
     */
    return _.merge({}, baseProfile, newPreferences);
  }
}

module.exports = PreferenceService;
