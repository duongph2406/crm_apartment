// API Test Utility for Bank Account Verification

import { verifyAccountName, BANK_CODES } from './bankService';

// Test data để kiểm tra API
const TEST_ACCOUNTS = [
  { bankCode: 'VCB', accountNumber: '9704360123456789', expected: 'NGUYEN VAN A' },
  { bankCode: 'BIDV', accountNumber: '9704180987654321', expected: 'TRAN THI B' },
  { bankCode: 'TCB', accountNumber: '9704071122334455', expected: 'LE VAN C' }
];

// Test API connection
export const testAPIConnection = async () => {
  console.log('🔍 Testing API connections...');
  
  const results = {
    vietqr: { status: 'unknown', message: '', latency: 0, errors: [] },
    mockapi: { status: 'unknown', message: '', latency: 0, errors: [] },
    demo: { status: 'working', message: '✅ Always available', latency: 0 },
    overall: { working: false, provider: null, totalLatency: 0, errors: [] }
  };

  // Test với tài khoản VCB sample
  const testAccount = TEST_ACCOUNTS[0];
  
  try {
    const startTime = Date.now();
    const result = await verifyAccountName(testAccount.bankCode, testAccount.accountNumber);
    const totalLatency = Date.now() - startTime;
    
    results.overall.totalLatency = totalLatency;
    results.overall.errors = result.errors || [];
    
    if (result.valid) {
      if (!result.isDemo) {
        results.overall.working = true;
        results.overall.provider = result.provider;
        
        if (result.provider === 'VietQR') {
          results.vietqr.status = 'working';
          results.vietqr.message = '✅ API hoạt động tốt';
          results.vietqr.latency = totalLatency;
        } else if (result.provider === 'MockAPI') {
          results.mockapi.status = 'working';
          results.mockapi.message = '✅ Mock API hoạt động tốt';
          results.mockapi.latency = totalLatency;
        }
      } else {
        results.overall.working = false;
        results.overall.provider = result.provider;
        
        // Parse errors to understand what failed
        if (result.errors) {
          result.errors.forEach(error => {
            if (error.includes('VietQR')) {
              results.vietqr.status = 'failed';
              results.vietqr.message = `❌ ${error}`;
              results.vietqr.errors.push(error);
            } else if (error.includes('MockAPI')) {
              results.mockapi.status = 'failed';
              results.mockapi.message = `❌ ${error}`;
              results.mockapi.errors.push(error);
            }
          });
        }
        
        // Set default messages if not set
        if (results.vietqr.status === 'unknown') {
          results.vietqr.status = 'failed';
          results.vietqr.message = '❌ API không khả dụng';
        }
        if (results.mockapi.status === 'unknown') {
          results.mockapi.status = 'failed';
          results.mockapi.message = '❌ Mock API không khả dụng';
        }
      }
    } else {
      results.overall.working = false;
      results.overall.provider = 'None';
      results.vietqr.status = 'failed';
      results.vietqr.message = '❌ Validation failed';
      results.mockapi.status = 'failed';
      results.mockapi.message = '❌ Validation failed';
    }
    
  } catch (error) {
    results.overall.working = false;
    results.overall.provider = 'Error';
    results.overall.errors.push(error.message);
    results.vietqr.status = 'error';
    results.vietqr.message = `❌ Exception: ${error.message}`;
    results.mockapi.status = 'error';
    results.mockapi.message = `❌ Exception: ${error.message}`;
  }

  console.log('🔍 API Test Results:', results);
  return results;
};

// Test với nhiều tài khoản
export const testMultipleAccounts = async () => {
  console.log('🔍 Testing multiple accounts...');
  
  const results = [];
  
  for (const testCase of TEST_ACCOUNTS) {
    try {
      const startTime = Date.now();
      const result = await verifyAccountName(testCase.bankCode, testCase.accountNumber);
      const latency = Date.now() - startTime;
      
      results.push({
        bankCode: testCase.bankCode,
        bankName: BANK_CODES[testCase.bankCode]?.name,
        accountNumber: testCase.accountNumber,
        result: result.accountName,
        expected: testCase.expected,
        success: result.valid,
        isDemo: result.isDemo,
        provider: result.provider,
        latency: latency,
        message: result.message
      });
      
      // Delay để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({
        bankCode: testCase.bankCode,
        bankName: BANK_CODES[testCase.bankCode]?.name,
        accountNumber: testCase.accountNumber,
        result: null,
        expected: testCase.expected,
        success: false,
        isDemo: false,
        provider: null,
        latency: 0,
        message: error.message,
        error: true
      });
    }
  }
  
  console.log('🔍 Multiple Account Test Results:', results);
  return results;
};

// Kiểm tra API keys
export const checkAPIKeys = () => {
  const keys = {
    vietqr: {
      clientId: process.env.REACT_APP_VIETQR_CLIENT_ID,
      apiKey: process.env.REACT_APP_VIETQR_API_KEY,
      configured: !!(process.env.REACT_APP_VIETQR_CLIENT_ID && process.env.REACT_APP_VIETQR_API_KEY)
    },
    casso: {
      apiKey: process.env.REACT_APP_CASSO_API_KEY,
      configured: !!process.env.REACT_APP_CASSO_API_KEY
    }
  };
  
  console.log('🔑 API Keys Status:', {
    vietqr: keys.vietqr.configured ? '✅ Configured' : '❌ Missing',
    casso: keys.casso.configured ? '✅ Configured' : '❌ Missing',
    fallback: '✅ Demo mode available'
  });
  
  return keys;
};

// Performance benchmark
export const benchmarkAPI = async (bankCode = 'VCB', accountNumber = '9704360123456789', iterations = 5) => {
  console.log(`🚀 Benchmarking API performance (${iterations} iterations)...`);
  
  const times = [];
  let successCount = 0;
  let provider = null;
  
  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();
      const result = await verifyAccountName(bankCode, accountNumber);
      const latency = Date.now() - startTime;
      
      times.push(latency);
      if (result.valid && !result.isDemo) {
        successCount++;
        provider = result.provider;
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.warn(`❌ Iteration ${i + 1} failed:`, error.message);
    }
  }
  
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  
  const benchmark = {
    iterations,
    successCount,
    successRate: Math.round((successCount / iterations) * 100),
    avgLatency: avgTime,
    minLatency: minTime,
    maxLatency: maxTime,
    provider,
    reliable: successCount >= iterations * 0.8 // 80% success rate
  };
  
  console.log('🚀 Benchmark Results:', benchmark);
  return benchmark;
};

// Utility để log API usage
export const logAPIUsage = () => {
  const usage = JSON.parse(localStorage.getItem('apiUsage') || '{}');
  const today = new Date().toDateString();
  
  if (!usage[today]) {
    usage[today] = { vietqr: 0, casso: 0, demo: 0 };
  }
  
  return usage[today];
};

export const incrementAPIUsage = (provider) => {
  const usage = JSON.parse(localStorage.getItem('apiUsage') || '{}');
  const today = new Date().toDateString();
  
  if (!usage[today]) {
    usage[today] = { vietqr: 0, casso: 0, demo: 0 };
  }
  
  if (provider === 'VietQR') usage[today].vietqr++;
  else if (provider === 'Casso') usage[today].casso++;
  else usage[today].demo++;
  
  localStorage.setItem('apiUsage', JSON.stringify(usage));
  
  return usage[today];
};

// Export all utilities
export default {
  testAPIConnection,
  testMultipleAccounts,
  checkAPIKeys,
  benchmarkAPI,
  logAPIUsage,
  incrementAPIUsage
}; 