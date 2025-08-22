const redisUtils = require('../utils/redisUtils');

// Cache middleware
const cacheMiddleware = (duration = 3600) => {k
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `api:${req.originalUrl}`;
      const cachedData = await redisUtils.getCache(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original send method
      const originalSend = res.json;

      // Override res.json method to cache the response
      res.json = function(data) {
        redisUtils.setCache(cacheKey, JSON.stringify(data), duration);
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Rate limiting middleware
const rateLimitMiddleware = (maxRequests = 100, windowMs = 900000) => {
  return async (req, res, next) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress;
      const key = `rate_limit:${clientIp}`;
      
      const currentRequests = await redisUtils.incrementRateLimit(key, windowMs / 1000);
      
      if (currentRequests > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - currentRequests),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
};

// Session middleware
const sessionMiddleware = () => {
  return async (req, res, next) => {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (sessionId) {
        const sessionData = await redisUtils.getSession(sessionId);
        if (sessionData) {
          req.session = sessionData;
          // Extend session
          await redisUtils.extendSession(sessionId);
        }
      }

      // Add session helper methods to response
      res.setSession = async (userData, expireTime = 86400) => {
        const sessionId = require('crypto').randomBytes(32).toString('hex');
        await redisUtils.setSession(sessionId, userData, expireTime);
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: expireTime * 1000
        });
        return sessionId;
      };

      res.clearSession = async () => {
        if (sessionId) {
          await redisUtils.deleteSession(sessionId);
        }
        res.clearCookie('sessionId');
      };

      next();
    } catch (error) {
      console.error('Session middleware error:', error);
      next();
    }
  };
};

// Token blacklist middleware
const tokenBlacklistMiddleware = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const isBlacklisted = await redisUtils.isBlacklisted(token);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: 'Token has been revoked'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Token blacklist middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const cacheInvalidationMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.json;

      res.json = async function(data) {
        // Invalidate cache patterns
        for (const pattern of patterns) {
          await redisUtils.deleteCache(pattern);
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache invalidation middleware error:', error);
      next();
    }
  };
};

// Redis health check middleware
const redisHealthMiddleware = () => {
  return async (req, res, next) => {
    try {
      const health = await redisUtils.healthCheck();
      
      if (health.status === 'disconnected') {
        console.warn('Redis is disconnected');
      }
      
      req.redisHealth = health;
      next();
    } catch (error) {
      console.error('Redis health middleware error:', error);
      req.redisHealth = { status: 'error', message: error.message };
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  rateLimitMiddleware,
  sessionMiddleware,
  tokenBlacklistMiddleware,
  cacheInvalidationMiddleware,
  redisHealthMiddleware
}; 