const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

async connect() {
  try {
    // Create Redis client
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            // Stop after 10 attempts
            return new Error("Retry attempts exhausted");
          }
          return Math.min(retries * 100, 3000); // backoff
        }
      }
    });

    // Event listeners
    this.client.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis connection ended');
      this.isConnected = false;
    });

    // Connect to Redis
    await this.client.connect();

    return this.client;
  } catch (error) {
    console.error('❗ Failed to connect to Redis:', error);
    throw error;
  }
}


async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('🔌 Redis disconnected');
    }
}

  // Utility methods for common Redis operations
async set(key, value, otpExpiry) {
  try {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const stringValue = JSON.stringify(value);
    console.log("DEBUG otpExpiry:", otpExpiry);

    if (otpExpiry !== null) {
      const expiry = parseInt(otpExpiry, 10);
      if (isNaN(expiry) || expiry <= 0) {
        throw new Error(`Invalid otpExpiry passed to Redis: ${otpExpiry}`);
      }

     await this.client.set(key, stringValue, { EX: expiry });
    } else {
      await this.client.set(key, stringValue);
    }

    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
}

async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
}

  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(' Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(' Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async flushAll() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error(' Redis FLUSHALL error:', error);
      return false;
    }
  }

  // Get Redis client instance
  getClient() {
    return this.client;
  }

  // Check if Redis is connected
  isRedisConnected() {
    return this.isConnected;
  }
}

// Create and export a singleton instance
const redisConnection = new RedisConnection();

module.exports = redisConnection; 