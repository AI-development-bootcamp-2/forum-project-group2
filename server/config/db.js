const { MongoClient } = require('mongodb');

let db = null;

/**
 * Enterprise Database Connection Manager.
 * Connects to MongoDB using the provided MONGO_URI.
 */
async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Successfully connected to the database infrastructure.');
    db = client.db();
    return db;
  } catch (err) {
    console.error('FAILED to establish database connection:', err);
    process.exit(1);
  }
}

module.exports = { connectDb };
