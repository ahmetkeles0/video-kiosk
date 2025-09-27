const express = require('express');
const cors = require('cors');
const multer = require('multer');
const QRCode = require('qrcode');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}.mp4`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Store active sessions
const activeSessions = new Map();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Video Kiosk API is running' });
});

// Start recording session
app.post('/api/start-recording', (req, res) => {
  const sessionId = Date.now().toString();
  const sessionData = {
    id: sessionId,
    status: 'recording',
    startTime: new Date(),
    videoPath: null,
    qrCode: null
  };
  
  activeSessions.set(sessionId, sessionData);
  
  // Emit to all connected kiosk devices
  io.emit('start-recording', { sessionId });
  
  res.json({ 
    success: true, 
    sessionId,
    message: 'Recording started' 
  });
});

// Stop recording and generate QR code
app.post('/api/stop-recording/:sessionId', upload.single('video'), (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  console.log('Stop recording request for session:', sessionId);
  console.log('File received:', req.file ? 'Yes' : 'No');
  
  if (!req.file) {
    console.log('No video file uploaded, but continuing with QR code generation');
    // Continue without video file for now
  }
  
  // Update session with video path
  session.videoPath = req.file ? req.file.path : null;
  session.status = 'completed';
  session.endTime = new Date();
  
  // Generate QR code with download URL
  const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${sessionId}`;
  
  QRCode.toDataURL(downloadUrl, (err, qrCodeDataUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }
    
    session.qrCode = qrCodeDataUrl;
    activeSessions.set(sessionId, session);
    
    // Emit to all connected devices
    io.emit('recording-completed', { 
      sessionId, 
      qrCode: qrCodeDataUrl,
      downloadUrl 
    });
    
    res.json({ 
      success: true, 
      qrCode: qrCodeDataUrl,
      downloadUrl,
      message: 'Recording completed and QR code generated' 
    });
  });
});

// Download video
app.get('/api/download/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (!session.videoPath) {
    return res.status(404).json({ error: 'Video not available yet' });
  }
  
  const videoPath = path.resolve(session.videoPath);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }
  
  res.download(videoPath, `kiosk-video-${sessionId}.mp4`);
});

// Get session status
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// Clean up old sessions (older than 24 hours)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionAge = now - session.startTime;
    if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
      if (session.videoPath && fs.existsSync(session.videoPath)) {
        fs.unlinkSync(session.videoPath);
      }
      activeSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('kiosk-register', (data) => {
    socket.kioskId = data.kioskId;
    console.log(`Kiosk registered: ${data.kioskId}`);
  });
  
  socket.on('recording-completed', (data) => {
    console.log('Recording completed event received:', data);
    // Broadcast to all connected clients
    io.emit('recording-completed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
