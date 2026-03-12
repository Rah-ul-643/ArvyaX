const { RateLimiterRedis } = require("rate-limiter-flexible");
const redis = require("../config/redis");

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "analyze-limit",
  points: 20,      // number of requests
  duration: 60     // per 60 seconds
});

async function analyzeLimiter(req, res, next) {

  const userId = req.body.userId || req.ip;

  try {

    await rateLimiter.consume(userId);

    next();

  } catch {

    res.status(429).json({
      error: "Too many analysis requests. Please try again later."
    });

  }

}

module.exports = analyzeLimiter;