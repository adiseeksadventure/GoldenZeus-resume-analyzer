import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);

//helth and system routes

// Root check (basic alive check)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "API running",
    service: "goldenzeus-ai-resume-analyzer",
    timestamp: new Date().toISOString()
  });
});

// Health endpoint (production standard)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "goldenzeus-ai-resume-analyzer",
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
    timestamp: new Date().toISOString()
  });
});

export default app;


