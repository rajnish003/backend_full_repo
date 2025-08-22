# Redis Setup Guide

This guide will help you set up Redis for your Homeasy Automate project.

## Prerequisites

- Node.js (v14 or higher)
- npm package manager

## Installation

### 1. Install Redis Package

The Redis package has already been installed in your project:

```bash
npm install redis
```

### 2. Install Redis Server

#### Windows (using WSL or Docker recommended)

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name redis-server -p 6379:6379 redis:latest
```

**Option B: Using WSL**
```bash
# Install WSL if not already installed
wsl --install

# Install Redis in WSL
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo service redis-server start
```

**Option C: Using Windows Subsystem for Linux (WSL)**
```bash
# In WSL terminal
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

#### macOS
```bash
# Using Homebrew
brew install redis
brew services start redis

# Or manually start
redis-server
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. Environment Configuration

Add the following Redis configuration to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

For production, you might want to use a Redis cloud service like:
- Redis Cloud
- AWS ElastiCache
- Azure Cache for Redis
- Google Cloud Memorystore

## Project Structure

The Redis integration includes the following files:

```
config/
├── redisConnection.js    # Redis connection configuration
utils/
├── redisUtils.js        # Redis utility functions
middlewares/
├── redisMiddleware.js   # Redis middleware for caching, rate limiting, etc.
routes/v1/
├── redisRoutes.js       # Redis management API endpoints
```

## Features

### 1. Caching
- API response caching
- Data caching with expiration
- Cache invalidation

### 2. Session Management
- User session storage
- Session expiration
- Session extension

### 3. Rate Limiting
- IP-based rate limiting
- Configurable limits and windows
- Rate limit headers

### 4. Token Management
- JWT token blacklisting
- User token storage
- Token expiration

### 5. Queue Management
- Simple queue operations
- Queue length monitoring
- FIFO queue processing

### 6. OTP Management
- OTP storage with expiration
- Secure OTP retrieval
- OTP cleanup

## Usage Examples

### Basic Redis Operations

```javascript
const redisUtils = require('./utils/redisUtils');

// Set cache
await redisUtils.setCache('user:123', { name: 'John', email: 'john@example.com' }, 3600);

// Get cache
const userData = await redisUtils.getCache('user:123');

// Delete cache
await redisUtils.deleteCache('user:123');
```

### Using Middleware

```javascript
const { cacheMiddleware, rateLimitMiddleware } = require('./middlewares/redisMiddleware');

// Apply caching to a route
app.get('/api/users', cacheMiddleware(1800), (req, res) => {
  // Route handler
});

// Apply rate limiting
app.use('/api/', rateLimitMiddleware(100, 900000)); // 100 requests per 15 minutes
```

### Session Management

```javascript
const { sessionMiddleware } = require('./middlewares/redisMiddleware');

app.use(sessionMiddleware());

// In your route handler
app.post('/login', async (req, res) => {
  // After successful authentication
  await res.setSession({ userId: user.id, role: user.role });
});

app.post('/logout', async (req, res) => {
  await res.clearSession();
});
```

## API Endpoints

The Redis management API provides the following endpoints:

### Health & Stats
- `GET /v1/redis/health` - Check Redis health
- `GET /v1/redis/stats` - Get Redis statistics

### Cache Management
- `POST /v1/redis/cache/set` - Set cache
- `GET /v1/redis/cache/get/:key` - Get cache
- `DELETE /v1/redis/cache/delete/:key` - Delete cache
- `DELETE /v1/redis/cache/clear` - Clear all cache

### Session Management
- `POST /v1/redis/session/set` - Set session
- `GET /v1/redis/session/get/:sessionId` - Get session
- `DELETE /v1/redis/session/delete/:sessionId` - Delete session

### Rate Limiting
- `GET /v1/redis/rate-limit/:key` - Get rate limit status

### Queue Management
- `POST /v1/redis/queue/add` - Add to queue
- `GET /v1/redis/queue/get/:queueName` - Get from queue
- `GET /v1/redis/queue/length/:queueName` - Get queue length

### Token Blacklist
- `POST /v1/redis/blacklist/add` - Add token to blacklist
- `GET /v1/redis/blacklist/check/:token` - Check if token is blacklisted

## Testing Redis Connection

You can test the Redis connection by making a request to:

```bash
curl http://localhost:4000/v1/redis/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "message": "Redis is healthy"
  }
}
```

## Troubleshooting

### Common Issues

1. **Redis connection refused**
   - Make sure Redis server is running
   - Check if Redis is running on the correct port (6379)
   - Verify firewall settings

2. **Redis authentication failed**
   - Check if Redis password is set correctly in `.env`
   - Verify Redis server configuration

3. **Memory issues**
   - Monitor Redis memory usage
   - Set appropriate maxmemory policy
   - Configure eviction policies

### Redis Commands for Debugging

```bash
# Connect to Redis CLI
redis-cli

# Check Redis info
INFO

# Monitor Redis commands
MONITOR

# Check memory usage
INFO memory

# List all keys
KEYS *

# Check specific key
GET key_name
```

## Performance Optimization

1. **Connection Pooling**: The Redis client is configured with connection pooling
2. **Error Handling**: Comprehensive error handling and retry logic
3. **Health Monitoring**: Built-in health checks and monitoring
4. **Memory Management**: Automatic key expiration and cleanup

## Security Considerations

1. **Network Security**: Use Redis over SSL/TLS in production
2. **Authentication**: Set strong Redis passwords
3. **Access Control**: Limit Redis access to trusted networks
4. **Data Encryption**: Consider encrypting sensitive data before storing in Redis

## Production Deployment

For production deployment:

1. Use a managed Redis service (Redis Cloud, AWS ElastiCache, etc.)
2. Enable Redis persistence (RDB/AOF)
3. Set up Redis clustering for high availability
4. Configure monitoring and alerting
5. Implement backup strategies
6. Use Redis Sentinel for failover

## Support

If you encounter any issues with Redis setup or usage, please check:

1. Redis server logs
2. Application logs
3. Network connectivity
4. Configuration files
5. Environment variables 