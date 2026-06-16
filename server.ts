import express from "express";
import path from "path";
import app from "./api/index";

const PORT = 3000;

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static build from /dist directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Transit Kiosk server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((error) => {
  console.error("Failed to boot full-stack app server:", error);
});
