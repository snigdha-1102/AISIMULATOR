import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
import apiRoutes from "./routes/api";
import { PORT } from "./config/aws";

dotenv.config();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: "*", // allow all origins for prototyping/Vercel/Render flexibility
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Future Self Simulator AI Backend is running.",
    mode: process.env.PROVIDER_MODE || "local",
    time: new Date().toISOString()
  });
});

// Dedicated health endpoint for uptime monitors (Render, UptimeRobot, etc.)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    mode: process.env.PROVIDER_MODE || "local",
    timestamp: new Date().toISOString()
  });
});

// Mounting API Router
app.use("/api", apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "API Route not found" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 FUTURE SELF SIMULATOR BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`🔧 Mode: ${process.env.PROVIDER_MODE || "local"}`);
  console.log(`====================================================`);
});
