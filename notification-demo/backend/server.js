const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Trong production nên đổi thành domain cụ thể của frontend
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

// Kết nối DB (Comment lại để tránh lỗi chạy demo nếu không có MONGODB_URI)
// mongoose.connect('mongodb://localhost:27017/notification_db')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/notifications', notificationRoutes);

// Socket.io logic
const connectedUsers = new Map(); // Ánh xạ userId => socket.id

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Khi user đăng nhập thành công, frontend sẽ emit 'register' cùng userId
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`Registered user ${userId} with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Xóa user khỏi map khi disconnect
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Helper function để tái sử dụng gửi thông báo
const sendNotification = async (recipientId, notificationData) => {
  // 1. Lưu vào DB (Giả định đã lưu)
  // const newNotification = await Notification.create({ recipient: recipientId, ...notificationData });
  
  // 2. Kiểm tra nếu user đang online
  const socketId = connectedUsers.get(recipientId);
  if (socketId) {
    // 3. Emit sự kiện cho client
    io.to(socketId).emit('new_notification', notificationData);
  }
};

// API test trigger notification
app.post('/api/test-trigger', (req, res) => {
  const { recipientId, notification } = req.body;
  sendNotification(recipientId, notification);
  res.status(200).json({ success: true, message: 'Notification triggered' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
