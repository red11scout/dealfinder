import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
import portfolioRoutes from "./routes/portfolio.js";
import varRoutes from "./routes/vars.js";
import maRoutes from "./routes/ma.js";
import chatRoutes from "./routes/chat.js";
import discoveryRoutes from "./routes/discovery.js";
import exportRoutes from "./routes/export.js";
app.use("/api", portfolioRoutes);
app.use("/api", varRoutes);
app.use("/api", maRoutes);
app.use("/api", chatRoutes);
app.use("/api", discoveryRoutes);
app.use("/api", exportRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Production: serve static files from Vite build
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
