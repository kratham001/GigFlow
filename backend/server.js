require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes');

connectDB();

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
  }
});



// DEBUGGING BLOCK - PASTE THIS IN SERVER.JS
const cookieParser = require('cookie-parser'); // Ensure this is at the top of file
app.use(cookieParser()); // Ensure this is used BEFORE routes

app.use((req, res, next) => {
  console.log("----- INCOMING REQUEST DEBUG -----");
  console.log("Origin:", req.headers.origin);
  console.log("Cookies:", req.cookies); // This checks if cookie exists
  console.log("Auth Header:", req.headers.authorization); 
  console.log("----------------------------------");
  next();
});










app.set('io', io);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => {
    if (userId) socket.join(userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));