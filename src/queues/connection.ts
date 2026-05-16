import IORedis from "ioredis";

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null, // Required by BullMQ
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});
