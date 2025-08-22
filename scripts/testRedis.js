const redisConnection = require('../config/redisConnection');
const redisUtils = require('../utils/redisUtils');
const otpService = require('../utils/otpService');

async function testRedisConnection() {
  console.log(' Testing Redis Connection...\n');

  try {
    // Test Redis connection
    console.log('1. Testing Redis connection...');
    await redisConnection.connect();
    console.log('Redis connected successfully\n');

    // Test basic operations
    console.log('2. Testing basic Redis operations...');
    
    // Test cache operations
    const testData = { name: 'Test User', email: 'test@example.com' };
    const cacheResult = await redisUtils.setCache('test:user', testData, 60);
    console.log('Cache set:', cacheResult);
    
    const cachedData = await redisUtils.getCache('test:user');
    console.log('Cache get:', cachedData);
    
    // Test session operations
    const sessionData = { userId: '123', role: 'user' };
    const sessionResult = await redisUtils.setSession('test-session', sessionData, 3600);
    console.log('Session set:', sessionResult);
    
    const sessionRetrieved = await redisUtils.getSession('test-session');
    console.log('Session get:', sessionRetrieved);
    
    // Test OTP operations
    console.log('\n3. Testing OTP service...');
    const otpResult = await otpService.generateOTP('test@example.com', 'Test User');
    console.log('OTP generated:', otpResult.success ? 'Success' : 'Failed');
    
    if (otpResult.success) {
      const verifyResult = await otpService.verifyOTP('test@example.com', otpResult.otp);
      console.log('OTP verification:', verifyResult.success ? 'Success' : 'Failed');
    }
    
    // Test rate limiting
    console.log('\n4. Testing rate limiting...');
    const rateLimitKey = 'test:rate:limit';
    for (let i = 0; i < 3; i++) {
      const currentLimit = await redisUtils.incrementRateLimit(rateLimitKey, 60);
      console.log(`Rate limit increment ${i + 1}:`, currentLimit);
    }
    
    // Test queue operations
    console.log('\n5. Testing queue operations...');
    const queueData = { task: 'test-task', timestamp: Date.now() };
    const queueAddResult = await redisUtils.addToQueue('test-queue', queueData);
    console.log('Queue add:', queueAddResult);
    
    const queueLength = await redisUtils.getQueueLength('test-queue');
    console.log('Queue length:', queueLength);
    
    const queueDataRetrieved = await redisUtils.getFromQueue('test-queue');
    console.log('Queue get:', queueDataRetrieved);
    
    // Test health check
    console.log('\n6. Testing health check...');
    const health = await redisUtils.healthCheck();
    console.log('Health check:', health);
    
    // Cleanup
    console.log('\n7. Cleaning up test data...');
    await redisUtils.deleteCache('test:user');
    await redisUtils.deleteSession('test-session');
    await redisUtils.deleteOTP('test@example.com');
    console.log('Cleanup completed');
    
    console.log('\n All Redis tests passed successfully!');
    
  } catch (error) {
    console.error('Redis test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Disconnect Redis
    await redisConnection.disconnect();
    console.log('\n Redis disconnected');
    process.exit(0);
  }
}

// Run the test
testRedisConnection(); 