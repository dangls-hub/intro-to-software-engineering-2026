import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import NotificationDropdown from './NotificationDropdown';
import './Notification.css';

// Component Icon Chuông
const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  // 1. Khởi tạo Socket.io và fetch data lần đầu
  useEffect(() => {
    // Gọi API lấy dữ liệu ban đầu
    fetchNotifications(1);

    // Kết nối Socket
    socketRef.current = io('http://localhost:5000');
    
    // Gửi userId để server đăng ký
    socketRef.current.emit('register', userId);

    // Lắng nghe sự kiện có thông báo mới
    socketRef.current.on('new_notification', (newNoti) => {
      // Tăng số lượng unread
      setUnreadCount(prev => prev + 1);
      
      // Đẩy thông báo mới lên đầu danh sách
      setNotifications(prev => [newNoti, ...prev]);
    });

    // Cleanup khi unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (pageNum) => {
    try {
      setLoading(true);
      // Giả định API GET /api/notifications?page=${pageNum}&limit=10
      const response = await fetch(`http://localhost:5000/api/notifications?page=${pageNum}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setNotifications(data.data);
          setUnreadCount(data.unreadCount);
        } else {
          setNotifications(prev => [...prev, ...data.data]);
        }
        setHasMore(data.data.length === 10);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read-all`, { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={toggleDropdown}>
        <span role="img" aria-label="bell" className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <NotificationDropdown 
          notifications={notifications}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
