import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Proxy ML API to FastAPI backend
    "/api/ml/*": async (req) => {
      const incomingUrl = new URL(req.url);
      const pathAfterPrefix = incomingUrl.pathname.replace(/^\/api\/ml/, "");
      const target = new URL(pathAfterPrefix || "/", "http://127.0.0.1:8001");
      // Keep query string
      target.search = incomingUrl.search;

      const init: RequestInit = {
        method: req.method,
        headers: req.headers,
      };
      if (req.method !== "GET" && req.method !== "HEAD") {
        const body = await req.arrayBuffer();
        init.body = body;
      }
      try {
        const upstream = await fetch(target, init);
        // Stream back response with headers and status
        return new Response(upstream.body, {
          status: upstream.status,
          headers: upstream.headers,
        });
      } catch (e: any) {
        return Response.json({ detail: e?.message || "Proxy error" }, { status: 502 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
