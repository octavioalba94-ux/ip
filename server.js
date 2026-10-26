import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--production");
const allowedOrigins = new Set([
  "https://octavioalba94-ux.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use("/api", (request, response, next) => {
  const origin = request.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) {
      return response.sendStatus(403);
    }

    response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    if (request.get("access-control-request-private-network") === "true") {
      response.set("Access-Control-Allow-Private-Network", "true");
    }
    return response.sendStatus(204);
  }

  next();
});

app.get("/api/device-info", (_request, response) => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.entries(interfaces)
    .flatMap(([name, entries]) => (entries ?? [])
      .filter((entry) => !entry.internal && entry.family === "IPv4")
      .map((entry) => ({ interface: name, address: entry.address })));

  response.json({
    hostname: os.hostname(),
    addresses: addresses.filter(
      (entry, index, list) => list.findIndex((candidate) => candidate.address === entry.address) === index,
    ),
  });
});

app.get("/api/health", (_request, response) => {
  response.sendStatus(200);
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

const host = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
app.listen(port, host, () => {
  console.log(`Servicio disponible en http://localhost:${port}`);
});
