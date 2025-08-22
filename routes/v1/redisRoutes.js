const express = require('express');
const router = express.Router();
const redisUtils = require('../../utils/redisUtils');
const { redisHealthMiddleware } = require('../../middlewares/redisMiddleware');

// Apply Redis health middleware to all routes
router.use(redisHealthMiddleware());

// Get Redis health status
router.get('/health', async (req, res) => {
  try {
    const health = await redisUtils.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check Redis health',
      error: error.message
    });
  }
});

// Get Redis statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await redisUtils.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get Redis stats',
      error: error.message
    });
  }
});

// Cache management routes
router.post('/cache/set', async (req, res) => {
  try {
    const { key, data, expireTime = 3600 } = req.body;
    
    if (!key || !data) {
      return res.status(400).json({
        success: false,
        message: 'Key and data are required'
      });
    }

    const result = await redisUtils.setCache(key, data, expireTime);
    
    res.json({
      success: result,
      message: result ? 'Cache set successfully' : 'Failed to set cache'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set cache',
      error: error.message
    });
  }
});

router.get('/cache/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await redisUtils.getCache(key);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache',
      error: error.message
    });
  }
});

router.delete('/cache/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisUtils.deleteCache(key);
    
    res.json({
      success: result,
      message: result ? 'Cache deleted successfully' : 'Failed to delete cache'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete cache',
      error: error.message
    });
  }
});

router.delete('/cache/clear', async (req, res) => {
  try {
    const result = await redisUtils.clearAllCache();
    
    res.json({
      success: result,
      message: result ? 'All cache cleared successfully' : 'Failed to clear cache'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Session management routes
router.post('/session/set', async (req, res) => {
  try {
    const { sessionId, userData, expireTime = 86400 } = req.body;
    
    if (!sessionId || !userData) {
      return res.status(400).json({
        success: false,
        message: 'SessionId and userData are required'
      });
    }

    const result = await redisUtils.setSession(sessionId, userData, expireTime);
    
    res.json({
      success: result,
      message: result ? 'Session set successfully' : 'Failed to set session'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set session',
      error: error.message
    });
  }
});

router.get('/session/get/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const data = await redisUtils.getSession(sessionId);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get session',
      error: error.message
    });
  }
});

router.delete('/session/delete/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await redisUtils.deleteSession(sessionId);
    
    res.json({
      success: result,
      message: result ? 'Session deleted successfully' : 'Failed to delete session'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
});

// Rate limiting routes
router.get('/rate-limit/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const currentLimit = await redisUtils.getRateLimit(key);
    
    res.json({
      success: true,
      data: {
        key,
        currentRequests: currentLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit',
      error: error.message
    });
  }
});

// Queue management routes
router.post('/queue/add', async (req, res) => {
  try {
    const { queueName, data } = req.body;
    
    if (!queueName || !data) {
      return res.status(400).json({
        success: false,
        message: 'QueueName and data are required'
      });
    }

    const result = await redisUtils.addToQueue(queueName, data);
    
    res.json({
      success: result,
      message: result ? 'Added to queue successfully' : 'Failed to add to queue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add to queue',
      error: error.message
    });
  }
});

router.get('/queue/get/:queueName', async (req, res) => {
  try {
    const { queueName } = req.params;
    const data = await redisUtils.getFromQueue(queueName);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get from queue',
      error: error.message
    });
  }
});

router.get('/queue/length/:queueName', async (req, res) => {
  try {
    const { queueName } = req.params;
    const length = await redisUtils.getQueueLength(queueName);
    
    res.json({
      success: true,
      data: {
        queueName,
        length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get queue length',
      error: error.message
    });
  }
});

// Token blacklist routes
router.post('/blacklist/add', async (req, res) => {
  try {
    const { token, expireTime = 86400 } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const result = await redisUtils.addToBlacklist(token, expireTime);
    
    res.json({
      success: result,
      message: result ? 'Token added to blacklist successfully' : 'Failed to add token to blacklist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add token to blacklist',
      error: error.message
    });
  }
});

router.get('/blacklist/check/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const isBlacklisted = await redisUtils.isBlacklisted(token);
    
    res.json({
      success: true,
      data: {
        token,
        isBlacklisted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check blacklist',
      error: error.message
    });
  }
});

module.exports = router; 