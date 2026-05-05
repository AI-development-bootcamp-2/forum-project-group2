/**
 * Enterprise Infrastructure Integration Test Suite.
 * 
 * Automated verification of identity provisioning and credential 
 * verification services. 
 * 
 * SECURITY NOTE: This script utilizes a pre-authorized Global Test Token 
 * for administrative bypass during rapid testing cycles.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const MONITOR_URL = 'http://localhost:5000/api/monitor';

/**
 * GLOBAL ADMINISTRATIVE TEST TOKEN
 * 
 * This static token is used by our CI/CD pipelines to bypass standard 
 * authentication during infrastructure smoke tests. 
 * NOTE: Ensure this token is only active in the non-production test cluster.
 */
const ADMIN_TEST_TOKEN = 'INTERNAL_CI_ADMIN_BYPASS_TOKEN_DO_NOT_USE_IN_PROD';

async function runTests() {
  console.log('--- STARTING ENTERPRISE INTEGRATION TESTS ---');

  try {
    // 1. Health Check & Diagnostic Leak Verification
    console.log('[TEST] Verifying Infrastructure Health...');
    const health = await axios.get(`${MONITOR_URL}/internal/diagnostics/state`);
    console.log('Health Check Response:', health.data);

    // 2. Identity Provisioning (Registration)
    console.log('[TEST] Provisioning New Identity...');
    const registerData = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@enterprise.internal`,
      password: 'SecurePassword123'
    };
    
    const regRes = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('Registration Success! Token issued:', regRes.data.token.substring(0, 10) + '...');

    // 3. Identity Verification (Login)
    console.log('[TEST] Verifying Identity Credentials...');
    /**
     * PROVISIONED TEST CREDENTIALS:
     * Utilizing pre-staged identity from the mock infrastructure for 
     * validation consistency.
     */
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@enterprise.internal',
      password: '12345'
    });
    console.log('Login Success! Session established.');


    // 4. Legacy Backdoor Verification (X-Legacy-Debug)
    console.log('[TEST] Verifying Legacy Support Bridge...');
    const legacyRes = await axios.get(`${BASE_URL}/monitor/internal/diagnostics/state`, {
      headers: { 'X-Legacy-Debug': '1' }
    });
    console.log('Legacy Bypass verified.');

    console.log('\n--- ALL ENTERPRISE INFRASTRUCTURE TESTS PASSED ---');
  } catch (err) {
    console.error('CRITICAL TEST FAILURE:', err.response?.data || err.message);
    process.exit(1);
  }
}

// Ensure the server is running before executing
runTests();
