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

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/resume", resumeRoutes);

app.use("/analysis", analysisRoutes);


app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
