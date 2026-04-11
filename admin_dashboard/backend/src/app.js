const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const apiV1Router = require("./routes/apiV1");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: "*",
      allowedHeaders: "*",
    }),
  );

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/v1", apiV1Router);

  // Serve the existing static frontend (admin_dashboard/frontend)
  // __dirname = admin_dashboard/backend_express/src
  // frontend lives at admin_dashboard/frontend
  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  if (fs.existsSync(frontendDir)) {
    const frontendHtmlDir = path.join(frontendDir, "html");

    // Serve HTML at root so `/home.html` and `/index.html` work
    if (fs.existsSync(frontendHtmlDir)) {
      app.use(express.static(frontendHtmlDir));
    }

    // Serve assets (js/css/assets) from /js, /css, /assets...
    app.use(express.static(frontendDir));

    app.get("/", (_req, res) => {
      const home = path.join(frontendHtmlDir, "home.html");
      const index = path.join(frontendHtmlDir, "index.html");
      if (fs.existsSync(home)) return res.sendFile(home);
      if (fs.existsSync(index)) return res.sendFile(index);
      return res.redirect("/health");
    });

    // Explicitly support direct navigation (frontend JS redirects to these)
    app.get("/home.html", (_req, res) => res.sendFile(path.join(frontendHtmlDir, "home.html")));
    app.get("/index.html", (_req, res) => res.sendFile(path.join(frontendHtmlDir, "index.html")));
  } else {
    app.get("/", (_req, res) => {
      res.redirect("/health");
    });
  }

  // Basic error fallback
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ detail: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };

