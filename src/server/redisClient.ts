import Redis from "ioredis";

const REDIS_URL = "redis://default:nlaNztWp6LXyBnzLimDCTnGkoESDAx1l@redis-13038.c263.us-east-1-2.ec2.redns.redis-cloud.com:13038";

// Create Redis connection
const redis = new Redis(REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Redis connection successful!");
});

redis.on("ready", () => {
  console.log("🚀 Redis connection is ready to use.");
});


redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("end", () => {
  console.warn("⚠️ Redis connection closed.");
});

// Warn if connection times out or is reconnecting
redis.on("reconnecting", (time:number) => {
  console.warn(`🔄 Redis reconnecting... Wait time: ${time}ms`);
});

export default redis;
