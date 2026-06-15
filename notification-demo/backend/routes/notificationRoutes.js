const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Middleware xác thực (giả lập)
const authMiddleware = (req, res, next) => {
  // Trong thực tế, bạn sẽ verify JWT token tại đây
  req.user = { id: 'user123' }; // Hardcode cho demo
  next();
};

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
