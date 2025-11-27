import express from "express";
import { AppDataSource } from "./data-source";
import router from "./routes/app.route";
import { buildOpenAPIRouter } from "./api-docs/openAPIRouter";
import cors from "cors";
import notFound from "./middleware/notFound";
import { errorHandler } from "./handler/error-handler";

import { connectRedis } from "./redisClient";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

connectRedis()
  .then(() => {
    console.log("Redis connected successfully");

    return AppDataSource.initialize();
  })
  .then(() => {
    console.log("Database connected successfully");
    app.use("/api-docs", buildOpenAPIRouter());
    app.use("/api", router);
    app.use(notFound);
    app.use(errorHandler);

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
      console.log("Swagger docs at http://localhost:3000/api-docs");
    });
  })
  .catch((err) => console.error("Error initializing services:", err));
