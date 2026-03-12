const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Make io accessible to our routes
app.set('io', io);

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidate'));
app.use('/api/vote', require('./routes/vote'));
app.use('/api/elections', require('./routes/election'));
app.use('/api/results', require('./routes/results'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log('MongoDB connection failed: ' + err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
