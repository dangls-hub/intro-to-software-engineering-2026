import React from 'react';

const NotificationDropdown = ({ notifications, loading, hasMore, onLoadMore, onMarkAllAsRead }) => {
  
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Kiểm tra xem đã cuộn xuống gần đáy chưa (cách đáy 20px)
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
              key={noti._id || Math.random()} 
              className={`notification-item ${!noti.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (noti.link) window.location.href = noti.link;
              }}
            >
              <div className="noti-icon">
                {noti.type === 'NEW_COMMENT' && '💬'}
                {noti.type === 'SYSTEM_MAINTENANCE' && '⚙️'}
                {noti.type === 'NEW_MESSAGE' && '✉️'}
              </div>
              <div className="noti-content">
                <p>{noti.content}</p>
                <span className="noti-time">
                  {new Date(noti.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
              {!noti.isRead && <span className="unread-dot"></span>}
            </div>
          ))
        )}
        
        {loading && <div className="loading-spinner">Đang tải...</div>}
        {!hasMore && notifications.length > 0 && (
          <div className="end-of-list">Hết thông báo</div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
