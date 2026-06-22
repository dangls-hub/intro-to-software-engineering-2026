import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ notifications = [], loading, hasMore, onLoadMore, onMarkAllAsRead, onMarkAsRead, onDeleteNotification, onDeleteAllNotifications, onClose }) => {
  const navigate = useNavigate();
  
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      onLoadMore();
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h4>Thông báo</h4>
        <button className="mark-read-btn" onClick={onMarkAllAsRead}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="dropdown-list" onScroll={handleScroll}>
        {notifications.length === 0 && !loading ? (
          <div className="no-notifications">Chưa có thông báo nào</div>
        ) : (
          notifications.map(noti => (
            <div 
              key={noti.id} 
              className={`notification-item ${!noti.isRead ? 'unread' : ''}`}
            >
              <div className="notification-item-content" onClick={async () => {
                if (!noti.isRead) await onMarkAsRead(noti.id);
                if (noti.link) {
                  navigate(noti.link);
                  if (onClose) onClose();
                }
              }}>
                <div className="noti-icon">
                  {noti.type === 'NEW_COMMENT' && '💬'}
                  {noti.type === 'SYSTEM_MAINTENANCE' && '⚙️'}
                  {noti.type === 'NEW_MESSAGE' && '✉️'}
                  {(!['NEW_COMMENT', 'SYSTEM_MAINTENANCE', 'NEW_MESSAGE'].includes(noti.type)) && '🔔'}
                </div>
                <div className="noti-content">
                  <p>{noti.content}</p>
                  <span className="noti-time">
                    {new Date(noti.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="notification-actions">
                {!noti.isRead && <span className="unread-dot"></span>}
                <button 
                  className="delete-noti-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(noti.id);
                  }}
                  title="Xóa thông báo"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
        
        {loading && <div className="loading-spinner">Đang tải...</div>}
        {!hasMore && notifications.length > 0 && (
          <div className="end-of-list">
            <button className="delete-all-btn" onClick={onDeleteAllNotifications}>
              Xóa hết thông báo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
