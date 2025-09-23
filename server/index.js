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

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.log(process.env.DATABASE_UR);
    console.error("Error acquiring client:", err.stack);
  } else {
    console.log("Connected to PostgreSQL database");
    release();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make pool available to routes
app.locals.pool = pool;

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
