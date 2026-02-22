require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");
const analysisRoutes = require("./routes/analysis.routes");

const app = express();


// Production-safe CORS


const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);


// Middleware


// Allow larger payloads for resume parsing / embeddings
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Routes


app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/analysis", analysisRoutes);



// System / Health Routes


// Root endpoint (Render uses this for initial validation)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "API running",
    service: "goldenzeus-ai-resume-analyzer",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});


// Health endpoint (useful for uptime monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime_seconds: process.uptime(),
    memory_usage_bytes: process.memoryUsage().rss,
    timestamp: new Date().toISOString(),
  });
});



// Global Error Handler


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});



// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("GoldenZeus Backend Running");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log("=================================");
});