import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import './Notification.css';

const NotificationBell = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const stompClient = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications(1);

    // Cấu hình STOMP client kết nối đến Spring Boot backend
    const client = new Client({
      // brokerURL: 'ws://localhost:8080/ws-notifications', // Nếu chỉ dùng WebSocket
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-notifications'),
      connectHeaders: {
        Authorization: `Bearer ${token}` // Gửi token để xác thực nếu Spring Security yêu cầu
      },
      onConnect: () => {
        console.log('STOMP Connected');
        // Lắng nghe channel dành riêng cho user này: /user/{userId}/queue/notifications
        // Do spring websocket cấu hình setUserDestinationPrefix("/user")
        client.subscribe('/user/queue/notifications', (message) => {
          if (message.body) {
            const newNoti = JSON.parse(message.body);
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [newNoti, ...prev]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        console.error('Details:', frame.body);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [userId, token]);

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
      const response = await fetch(`http://localhost:8080/api/v1/notifications?page=${pageNum}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();

      if (response.ok && result.data) {
        if (pageNum === 1) {
          setNotifications(result.data);
          setUnreadCount(result.unreadCount || 0);
        } else {
          setNotifications(prev => [...prev, ...result.data]);
        }
        setHasMore(result.currentPage < result.totalPages);
      } else {
        console.error("API Error or no data:", result);
        if (pageNum === 1) setNotifications([]);
      }
    } catch (error) {
      console.error("Fetch notifications failed", error);
      if (pageNum === 1) setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:8080/api/v1/notifications/read-all`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Mark all as read failed", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/v1/notifications/${id}/read`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Mark as read failed", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/v1/notifications/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => {
        const noti = prev.find(n => n.id === id);
        if (noti && !noti.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (error) {
      console.error("Delete notification failed", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await fetch(`http://localhost:8080/api/v1/notifications/all`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
    } catch (error) {
      console.error("Delete all notifications failed", error);
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        className="header-bell"
        type="button"
        aria-label="Thông báo"
        onClick={toggleDropdown}
      >
        <Bell size={16} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="header-bell-dot" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          notifications={notifications}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
          onDeleteNotification={deleteNotification}
          onDeleteAllNotifications={deleteAllNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
