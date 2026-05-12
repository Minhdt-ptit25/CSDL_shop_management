const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const apiV1Router = require("./routes/index");

function createApp() {
  const app = express();

  app.use(cors({ origin: "*", credentials: true, methods: "*", allowedHeaders: "*" }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/v1", apiV1Router);

  // Serve frontend tĩnh nếu có
  const frontendDir    = path.join(__dirname, "..", "..", "frontend");
  const frontendHtmlDir = path.join(frontendDir, "html");

  if (fs.existsSync(frontendDir)) {
    if (fs.existsSync(frontendHtmlDir)) app.use(express.static(frontendHtmlDir));
    app.use(express.static(frontendDir));

    app.get("/", (_req, res) => {
      const home  = path.join(frontendHtmlDir, "home.html");
      const index = path.join(frontendHtmlDir, "index.html");
      if (fs.existsSync(home))  return res.sendFile(home);
      if (fs.existsSync(index)) return res.sendFile(index);
      return res.redirect("/health");
    });

    app.get("/home.html",  (_req, res) => res.sendFile(path.join(frontendHtmlDir, "home.html")));
    app.get("/index.html", (_req, res) => res.sendFile(path.join(frontendHtmlDir, "index.html")));
  } else {
    app.get("/", (_req, res) => res.redirect("/health"));
  }

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ detail: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
