import express from "express";
import { AppDataSource } from "./data-source";
import router from "./routes/app.route";
import { buildOpenAPIRouter } from "./api-docs/openAPIRouter";
import cors from "cors";
import notFound from "./middleware/notFound";
import { errorHandler } from "./handler/error-handler";

import { connectRedis } from "./redisClient";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-card", (cardId: number) => {
    socket.join(`card-${cardId}`);
    console.log(`Joined room card-${cardId}`);
  });

  socket.on("leave-card", (cardId: number) => {
    socket.leave(`card-${cardId}`);
    console.log(`Left room card-${cardId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

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

    server.listen(3000, () => {
      console.log("Server + Socket running at http://localhost:3000/api");
      console.log("Swagger docs at http://localhost:3000/api-docs");
    });
  })
  .catch((err) => console.error("Error initializing services:", err));
