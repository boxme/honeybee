require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const { authenticateSocket } = require("./middleware/auth");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Database connection configuration
const isProduction = process.env.NODE_ENV === "production";
let databaseUrl = process.env.DATABASE_URL;

// For production, ensure SSL mode is in the connection string
if (isProduction && databaseUrl && !databaseUrl.includes("sslmode")) {
  databaseUrl += databaseUrl.includes("?")
    ? "&sslmode=no-verify"
    : "?sslmode=no-verify";
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction ? {
    rejectUnauthorized: false, // DigitalOcean uses self-signed certificates
  } : false,
});

// Test database connection asynchronously (non-blocking)
setTimeout(() => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Database connection error:", err.message);
      console.error(
        "Connection string (masked):",
        databaseUrl ? "Set" : "Not set"
      );
      console.error("SSL mode (PGSSLMODE):", process.env.PGSSLMODE || "Not set");
      console.error("SSL config:", isProduction ? "rejectUnauthorized: false" : "disabled");
    } else {
      console.log("✓ Connected to PostgreSQL database successfully");
      console.log("Database SSL mode:", isProduction ? "enabled (no-verify)" : "disabled");
      release();
    }
  });
}, 100);

// Middleware
app.use(cors());
app.use(express.json());

// Make pool available to routes
app.locals.pool = pool;

// Health check endpoint (doesn't require database)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Socket.io for real-time updates
io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.join(`user_${socket.userId}`);

  socket.on("join_partner_room", (partnerId) => {
    socket.join(`user_${partnerId}`);
  });

  socket.on("event_created", (eventData) => {
    socket.broadcast
      .to(`user_${eventData.partnerId}`)
      .emit("new_event", eventData);
  });

  socket.on("event_updated", (eventData) => {
    socket.broadcast
      .to(`user_${eventData.partnerId}`)
      .emit("event_updated", eventData);
  });

  socket.on("event_deleted", (eventData) => {
    socket.broadcast
      .to(`user_${eventData.partnerId}`)
      .emit("event_deleted", eventData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
