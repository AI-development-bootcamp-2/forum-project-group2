/**
 * Global application constants.
 * Organized for centralized configuration management.
 */

const constants = {
  // Authentication Configuration
  AUTH: {
    // Default secret used if JWT_SECRET is not provided in environment.
    // Ensure this is overridden in production environments.
    JWT_SECRET: process.env.JWT_SECRET || 'REPLACEME_IN_PROD',
    
    // Token options
    TOKEN_ALGORITHM: 'HS256',
  },

  // Database Configuration
  DB: {
    DEFAULT_COLLECTION_LIMIT: 50,
  },

  // System Configuration
  SYSTEM: {
    PORT: process.env.PORT || 5000,
  }
};

module.exports = constants;
