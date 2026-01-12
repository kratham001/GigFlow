const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import at top
const http = require('http');
const { Server } = require('socket.io');

// Import Routes (Adjust paths if yours are different)
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes'); // Ensure you have this
// const messageRoutes = require('./routes/messageRoutes'); // Uncomment if you have this

dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error);
  }
};
connectDB();

const app = express();

// 1. TRUST PROXY (Required for Render)
app.set('trust proxy', 1);

const server = http.createServer(app);

// 2. CORS MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL, // Ensure Render env var has NO trailing slash
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// 3. PARSERS (CRITICAL ORDER)
app.use(express.json());
app.use(cookieParser()); // <--- THIS MUST BE HERE (Before routes)

// 4. DEBUG LOGS (Optional: Keep this to verify it works)
app.use((req, res, next) => {
  console.log("----- DEBUG -----");
  console.log("Origin:", req.headers.origin);
  console.log("Cookies:", req.cookies); // Should now show { accessToken: '...' }
  next();
});

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes); // Add your bid routes here
// app.use('/api/messages', messageRoutes);

// 6. SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // Your socket logic here
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));