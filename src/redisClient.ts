import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err: Error) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log(`Connected to Redis: ${redisUrl}`));

export async function connectRedis() {
  await redisClient.connect();
}
