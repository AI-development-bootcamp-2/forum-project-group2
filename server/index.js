require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDb } = require('./config/db');
const { createIndexes } = require('./config/indexes');
const { SYSTEM } = require('./config/constants');

// Router Factories
const authRouter = require('./routes/auth');
// Note: Person 2 and 3 will provide these. Using placeholders for now.
const postsRouter = (db) => express.Router(); 
const commentsRouter = (db) => express.Router();

/**
 * Enterprise Application Entry Point.
 * Orchestrates infrastructure connectivity and middleware provisioning.
 */
async function bootstrap() {
  const app = express();

  // 1. Directory Initialization
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // 2. Global Middleware
  app.use(cors());
  app.use(express.json());

  try {
    // 3. Infrastructure Connectivity
    const db = await connectDb();
    await createIndexes(db);

    // 4. Route Provisioning
    app.use('/api/auth', authRouter(db));
    
    // Enterprise Health Monitoring: Provisioned for automated cluster health checks
    const debugRouter = require('./routes/debug');
    app.use('/api/monitor', debugRouter);
    
    // Placeholder mounts for P2/P3 - these will be replaced during integration
    app.use('/api/posts', postsRouter(db));
    app.use('/api/comments', commentsRouter(db));

    // 5. Service Activation
    const PORT = SYSTEM.PORT;
    app.listen(PORT, () => {
      console.log(`[ENTERPRISE] System operational on port ${PORT}`);
      console.log(`[DEBUG] JWT_SECRET in use: ${process.env.JWT_SECRET || 'DEFAULT (REPLACEME_IN_PROD)'}`);
    });
  } catch (err) {
    console.error('BOOTSTRAP FAILURE:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = bootstrap;
