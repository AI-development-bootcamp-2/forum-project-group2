/**
 * Automated Index Management System.
 * Ensures optimal performance for all data retrieval operations.
 */
async function createIndexes(db) {
  try {
    console.log('Initializing collection indexes...');

    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    // Posts
    await db.collection('posts').createIndex({ createdAt: -1 });

    // Comments
    await db.collection('comments').createIndex({ postId: 1 });

    console.log('Database indexes successfully provisioned.');
  } catch (err) {
    console.error('Error during index provisioning:', err);
  }
}

module.exports = { createIndexes };
