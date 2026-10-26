import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--production");
const allowedWebOrigin = process.env.WEB_ORIGIN;

app.use("/api", (request, response, next) => {
  const origin = request.get("origin");
  if (origin && allowedWebOrigin && origin === allowedWebOrigin) {
    response.set("Access-Control-Allow-Origin", allowedWebOrigin);
    response.set("Vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    return response.sendStatus(204);
  }

  next();
});

app.get("/api/device-info", (_request, response) => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flatMap((entries) => entries ?? [])
    .filter((entry) => !entry.internal && entry.family === "IPv4")
    .map((entry) => entry.address);

  response.json({
    hostname: os.hostname(),
    addresses: [...new Set(addresses)],
  });
});

if (isProduction) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Servicio disponible en http://localhost:${port}`);
});
