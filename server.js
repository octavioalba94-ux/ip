import os from "node:os";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--production");
const allowedWebOrigin = process.env.WEB_ORIGIN;
const allowedOrigins = new Set([
  "https://octavioalba94-ux.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(allowedWebOrigin ? [allowedWebOrigin] : []),
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

app.get("/api/device-info", async (_request, response) => {
  let publicIp;
  try {
    const publicIpResponse = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(8000),
    });
    if (!publicIpResponse.ok) {
      console.error(`Public IP lookup failed with status ${publicIpResponse.status}.`);
      return response.status(502).json({
        error: "No se pudo consultar la IP pública. Inténtalo de nuevo.",
      });
    }

    ({ ip: publicIp } = await publicIpResponse.json());
  } catch (error) {
    console.error("Public IP lookup request failed:", error);
    return response.status(502).json({
      error: "No se pudo consultar la IP pública. Inténtalo de nuevo.",
    });
  }

  if (typeof publicIp !== "string" || !net.isIPv4(publicIp)) {
    console.error("Public IP lookup returned an invalid IPv4 address.");
    return response.status(502).json({
      error: "El servicio de consulta devolvió una IP pública no válida.",
    });
  }

  const interfaces = os.networkInterfaces();
  const addresses = Object.entries(interfaces)
    .flatMap(([name, entries]) => (entries ?? [])
      .filter((entry) => !entry.internal && entry.family === "IPv4")
      .map((entry) => ({ interface: name, address: entry.address })));

  response.json({
    hostname: os.hostname(),
    publicIp,
    addresses: addresses.filter(
      (entry, index, list) => list.findIndex((candidate) => candidate.address === entry.address) === index,
    ),
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
