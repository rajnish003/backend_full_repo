const redisConnection = require('../config/redisConnection.js');

class RedisUtils {
  constructor() {
    this.redis = redisConnection;
  }

  // Cache management
  async setCache(key, data, expireTime = 3600) {
    try {
      const cacheKey = `cache:${key}`;
      return await this.redis.set(cacheKey, data, expireTime);
    } catch (error) {
      console.error('Cache SET error:', error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const cacheKey = `cache:${key}`;
      return await this.redis.get(cacheKey);
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  }

  async deleteCache(key) {
    try {
      const cacheKey = `cache:${key}`;
      return await this.redis.del(cacheKey);
    } catch (error) {
      console.error('Cache DELETE error:', error);
      return false;
    }
  }

  async clearAllCache() {
    try {
      const client = this.redis.getClient();
      if (!client) return false;
      
      const keys = await client.keys('cache:*');
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }

  // Session management
  async setSession(sessionId, userData, expireTime = 86400) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await this.redis.set(sessionKey, userData, expireTime);
    } catch (error) {
      console.error('Session SET error:', error);
      return false;
    }
  }

  async getSession(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await this.redis.get(sessionKey);
    } catch (error) {
      console.error('Session GET error:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await this.redis.del(sessionKey);
    } catch (error) {
      console.error('Session DELETE error:', error);
      return false;
    }
  }

  async extendSession(sessionId, expireTime = 86400) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await this.redis.expire(sessionKey, expireTime);
    } catch (error) {
      console.error('Session EXTEND error:', error);
      return false;
    }
  }

  // Rate limiting
  async incrementRateLimit(key, expireTime = 60) {
    try {
      const rateLimitKey = `rate_limit:${key}`;
      const client = this.redis.getClient();
      
      if (!client) return 0;
      
      const current = await client.incr(rateLimitKey);
      if (current === 1) {
        await client.expire(rateLimitKey, expireTime);
      }
      return current;
    } catch (error) {
      console.error('Rate limit increment error:', error);
      return 0;
    }
  }

  async getRateLimit(key) {
    try {
      const rateLimitKey = `rate_limit:${key}`;
      const client = this.redis.getClient();
      
      if (!client) return 0;
      
      const current = await client.get(rateLimitKey);
      return current ? parseInt(current) : 0;
    } catch (error) {
      console.error('Rate limit GET error:', error);
      return 0;
    }
  }

  // Store OTP (stringify the object)
async setOTP(email, otpData, expireTime) {
  try {
    if (!email || !otpData) {
      throw new Error('Email and OTP data are required');
    }

    const otpKey = `otp:${email}`;
    const value = JSON.stringify(otpData);
    
    // Ensure expireTime is a valid number
    const expiry = parseInt(expireTime, 10);
    if (isNaN(expiry) || expiry <= 0) {
      throw new Error(`Invalid expiry time: ${expireTime}`);
    }

    console.log('Setting OTP with params:', {
      key: otpKey,
      expiry,
      dataLength: value.length
    });

    const result = await this.redis.set(otpKey, value, expiry);
    return result ? true : false;
  } catch (error) {
    console.error('Redis setOTP error:', error);
    return false;
  }
}


async getOTP(email) {
  try {
    const otpKey = `otp:${email}`;
    const data = await this.redis.get(otpKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('OTP GET error:', error);
    return null;
  }
}

async deleteOTP(email) {
    try {
      const otpKey = `otp:${email}`;
      return await this.redis.del(otpKey);
    } catch (error) {
      console.error('OTP DELETE error:', error);
      return false;
    }
  }
  // User tokens
async setUserToken(userId, token, expireTime = 86400) {
    try {
      const tokenKey = `user_token:${userId}`;
      return await this.redis.set(tokenKey, token, expireTime);
    } catch (error) {
      console.error('User token SET error:', error);
      return false;
    }
  }

async getUserToken(userId) {
    try {
      const tokenKey = `user_token:${userId}`;
      return await this.redis.get(tokenKey);
    } catch (error) {
      console.error('User token GET error:', error);
      return null;
    }
  }

async deleteUserToken(userId) {
    try {
      const tokenKey = `user_token:${userId}`;
      return await this.redis.del(tokenKey);
    } catch (error) {
      console.error('User token DELETE error:', error);
      return false;
    }
  }

  // Blacklist tokens
async addToBlacklist(token, expireTime = 86400) {
    try {
      const blacklistKey = `blacklist:${token}`;
      return await this.redis.set(blacklistKey, 'blacklisted', expireTime);
    } catch (error) {
      console.error('Blacklist ADD error:', error);
      return false;
    }
  }

async isBlacklisted(token) {
    try {
      const blacklistKey = `blacklist:${token}`;
      return await this.redis.exists(blacklistKey);
    } catch (error) {
      console.error('Blacklist CHECK error:', error);
      return false;
    }
  }

  // Queue management
async addToQueue(queueName, data) {
    try {
      const queueKey = `queue:${queueName}`;
      const client = this.redis.getClient();
      
      if (!client) return false;
      
      await client.lpush(queueKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Queue ADD error:', error);
      return false;
    }
  }

async getFromQueue(queueName) {
    try {
      const queueKey = `queue:${queueName}`;
      const client = this.redis.getClient();
      
      if (!client) return null;
      
      const data = await client.rpop(queueKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Queue GET error:', error);
      return null;
    }
  }

async getQueueLength(queueName) {
    try {
      const queueKey = `queue:${queueName}`;
      const client = this.redis.getClient();
      
      if (!client) return 0;
      
      return await client.llen(queueKey);
    } catch (error) {
      console.error('Queue LENGTH error:', error);
      return 0;
    }
  }

  // Health check
async healthCheck() {
    try {
      if (!this.redis.isRedisConnected()) {
        return { status: 'disconnected', message: 'Redis not connected' };
      }
      
      const client = this.redis.getClient();
      await client.ping();
      return { status: 'connected', message: 'Redis is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Get Redis statistics
async getStats() {
    try {
      const client = this.redis.getClient();
      if (!client) return null;
      
      const info = await client.info();
      return info;
    } catch (error) {
      console.error('Redis stats error:', error);
      return null;
    }
  }
}

module.exports = new RedisUtils(); 