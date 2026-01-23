require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");
const analysisRoutes = require("./routes/analysis.routes");

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// middleware
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/analysis", analysisRoutes);

// system routes

// Root check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "API running",
    service: "goldenzeus-ai-resume-analyzer",
    timestamp: new Date().toISOString()
  });
});

// Health endpoint 
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
    timestamp: new Date().toISOString()
  });
});

//server bind
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
