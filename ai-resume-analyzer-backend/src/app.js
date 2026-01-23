import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

export default app;

