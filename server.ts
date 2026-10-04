import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3005", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Attach WebSocket / Socket.io server
  initializeSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`🚀 [Ready] HTTP & Next.js running on http://${hostname}:${port}`);
    console.log(`⚡ [Realtime] Socket.io gateway listening at /socket.io`);
  });
});
