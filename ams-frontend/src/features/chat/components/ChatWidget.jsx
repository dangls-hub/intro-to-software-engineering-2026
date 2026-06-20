import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, User, Paperclip, FileText, FileArchive, FileCode, File, Download } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../../store/authStore';
import { getAuthToken } from '../../../lib/apiClient';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Mentions state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const [systemUsers, setSystemUsers] = useState([]);
  const [initialHistoryLength, setInitialHistoryLength] = useState(null);
  const [lastViewedLength, setLastViewedLength] = useState(0);

  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { messages, sendMessage, isConnected, isHistoryLoaded } = useChat();
  const { user } = useAuth();

  // Record history length when first loaded
  useEffect(() => {
    if (isHistoryLoaded && initialHistoryLength === null) {
      setInitialHistoryLength(messages.length);
    }
  }, [isHistoryLoaded, messages.length, initialHistoryLength]);

  // Update last viewed length whenever chat is open
  useEffect(() => {
    if (isOpen) {
      setLastViewedLength(messages.length);
    }
  }, [isOpen, messages.length]);

  // Declarative unread count calculation
  const baseLength = Math.max(initialHistoryLength || 0, lastViewedLength);
  const unreadCount = Math.max(0, messages.length - baseLength);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    if (lightboxUrl) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Fetch system users for mentions if not already fetched
      if (systemUsers.length === 0) {
        fetch('http://localhost:8080/api/v1/auth/users/usernames', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.data) {
              setSystemUsers(data.data);
            }
          })
          .catch(err => console.error('Failed to fetch system users', err));
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, systemUsers.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), 'TEXT', null);
      setInputValue('');
      setShowMentions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Get cursor position and text up to cursor
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    
    // Check if the last word is a mention
    const words = textBeforeCursor.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.substring(1));
      setMentionCursorPos(cursorPos - lastWord.length);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const textBeforeMention = inputValue.substring(0, mentionCursorPos);
    const textAfterCursor = inputValue.substring(mentionCursorPos + mentionFilter.length + 1);
    
    const newText = `${textBeforeMention}@${username} ${textAfterCursor}`;
    setInputValue(newText);
    setShowMentions(false);
  };

  // Filter system users based on the current filter text
  const filteredMentionUsers = systemUsers
    .filter(name => name && name !== user?.username && name.toLowerCase().includes(mentionFilter.toLowerCase()));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine message type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const type = isVideo ? 'VIDEO' : isImage ? 'IMAGE' : 'FILE';

    // File size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('Tệp quá lớn! Vui lòng chọn tệp nhỏ hơn 50MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      const mediaUrl = data.url;

      // For FILE type, put original filename in content
      const content = type === 'FILE' ? file.name : '';
      sendMessage(content, type, mediaUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Không thể tải tệp lên. Vui lòng thử lại sau.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <File size={28} />;
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return <FileText size={28} style={{ color: '#ef4444' }} />;
    if (['doc', 'docx'].includes(ext)) return <FileText size={28} style={{ color: '#3b82f6' }} />;
    if (['xls', 'xlsx'].includes(ext)) return <FileText size={28} style={{ color: '#22c55e' }} />;
    if (['ppt', 'pptx'].includes(ext)) return <FileText size={28} style={{ color: '#f97316' }} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive size={28} style={{ color: '#a855f7' }} />;
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs'].includes(ext)) return <FileCode size={28} style={{ color: '#06b6d4' }} />;
    if (['exe', 'msi', 'dmg', 'apk'].includes(ext)) return <FileCode size={28} style={{ color: '#f59e0b' }} />;
    return <File size={28} style={{ color: 'var(--text-muted)' }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getRoleColor = (role) => {
    if (role === 'ADMIN' || role === 'MANAGER') return 'text-red-600 font-bold';
    if (role === 'STAFF') return 'text-orange-500 font-bold';
    return 'text-blue-600 font-semibold';
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-1">BQL</span>;
    if (role === 'STAFF') return <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded ml-1">NV</span>;
    return null;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Only show for logged in users
  if (!user) return null;

  return createPortal(
    <div 
      className="flex flex-col items-end"
      style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px', 
        zIndex: 99999
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className="liquid-glass mb-4 shadow-[var(--shadow-xl)]" 
          style={{ width: '380px', height: '600px', maxHeight: 'calc(100vh - 100px)', position: 'relative', display: 'block', overflow: 'hidden' }}
        >
          <style>{`
            .ams-chat-messages::-webkit-scrollbar { width: 8px; }
            .ams-chat-messages::-webkit-scrollbar-track { background: transparent; }
            .ams-chat-messages::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.4); border-radius: 10px; }
            .ams-chat-messages::-webkit-scrollbar-thumb:hover { background-color: rgba(150, 150, 150, 0.7); }
          `}</style>
          
          {/* INNER WRAPPER: Overriding .liquid-glass > * with inline static position so children position relative to .liquid-glass */}
          <div style={{ width: '100%', height: '100%', position: 'static' }}>
            
            {/* Header */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', backgroundColor: 'var(--bg-card-solid)', borderBottom: '1px solid var(--border)', color: 'var(--text-heading)' }}>
              <div className="flex items-center gap-2">
                <MessageCircle size={22} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>Cộng đồng BlueMoon</h3>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isConnected ? '#34d399' : '#f87171', marginLeft: '8px' }} className="animate-pulse" title={isConnected ? 'Đã kết nối' : 'Đang kết nối...'}></div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="ams-chat-messages" style={{ position: 'absolute', top: '60px', bottom: '80px', left: 0, right: 0, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 10, backgroundColor: 'transparent' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginTop: '40px' }}>
                  Chưa có tin nhắn nào. Hãy là người đầu tiên!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderName === user.username;
                  const isFirstInGroup = idx === 0 || messages[idx - 1].senderName !== msg.senderName;
                  const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].senderName !== msg.senderName;
                  
                  return (
                    <div key={msg.id || idx} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, alignItems: isMe ? 'flex-end' : 'flex-start', marginTop: isFirstInGroup && idx > 0 ? '12px' : '0px' }}>
                      {!isMe && isFirstInGroup && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', marginLeft: '2px' }}>
                          <span className={getRoleColor(msg.senderRole)} style={{ fontSize: '12px' }}>
                            {msg.senderName}
                          </span>
                          {getRoleBadge(msg.senderRole)}
                        </div>
                      )}
                      <div
                        style={{
                          padding: msg.type !== 'TEXT' && !msg.content ? '0' : '7px 12px',
                          fontSize: '14px',
                          lineHeight: 1.3,
                          maxWidth: '85%',
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          backgroundColor: isMe ? 'var(--accent)' : 'var(--bg-card-solid)',
                          color: isMe ? '#0b1f28' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          borderRadius: isMe
                            ? `18px ${isFirstInGroup ? '18px' : '4px'} ${isLastInGroup ? '18px' : '4px'} 18px`
                            : `${isFirstInGroup ? '18px' : '4px'} 18px 18px ${isLastInGroup ? '18px' : '4px'}`,
                          fontWeight: isMe ? 500 : 400,
                          overflow: 'hidden'
                        }}
                      >
                        {msg.type === 'IMAGE' && msg.mediaUrl && (
                          <img 
                            src={`http://localhost:8080${msg.mediaUrl}`} 
                            alt="chat media" 
                            onClick={() => setLightboxUrl(`http://localhost:8080${msg.mediaUrl}`)}
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '250px', 
                              objectFit: 'cover',
                              borderRadius: msg.content ? '16px 16px 0 0' : '16px',
                              display: 'block',
                              cursor: 'zoom-in'
                            }} 
                          />
                        )}
                        {msg.type === 'VIDEO' && msg.mediaUrl && (
                          <video 
                            src={`http://localhost:8080${msg.mediaUrl}`} 
                            controls
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '250px',
                              borderRadius: msg.content ? '16px 16px 0 0' : '16px',
                              display: 'block'
                            }} 
                          />
                        )}
                        {msg.type === 'FILE' && msg.mediaUrl && (
                          <a
                            href={`http://localhost:8080${msg.mediaUrl}`}
                            download={msg.content || 'file'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              textDecoration: 'none',
                              color: 'inherit',
                              borderRadius: '12px',
                              backgroundColor: isMe ? 'rgba(0,0,0,0.12)' : 'rgba(128,128,128,0.1)',
                              transition: 'background 0.2s',
                              minWidth: '180px',
                              maxWidth: '220px'
                            }}
                          >
                            <div style={{ flexShrink: 0 }}>{getFileIcon(msg.content)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {msg.content || 'Tệp đính kèm'}
                              </div>
                              <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '2px' }}>
                                {msg.content?.split('.').pop()?.toUpperCase() || 'FILE'} • Nhấn để tải
                              </div>
                            </div>
                            <Download size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
                          </a>
                        )}
                        {msg.type !== 'FILE' && msg.content && (
                          <div style={{ padding: msg.type !== 'TEXT' ? '10px 16px' : '0' }}>
                            {msg.content}
                          </div>
                        )}
                      </div>
                      {(!messages[idx + 1] || messages[idx + 1].senderName !== msg.senderName || formatTime(messages[idx + 1].timestamp) !== formatTime(msg.timestamp)) && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', marginLeft: isMe ? 0 : '4px', marginRight: isMe ? '4px' : 0 }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20, backgroundColor: 'var(--bg-card-solid)', borderTop: '1px solid var(--border)' }}>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected || isUploading}
                style={{ padding: '10px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: (!isConnected || isUploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                title="Đính kèm tệp (ảnh, video, PDF, Word...)"
              >
                <Paperclip size={22} />
              </button>

              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                {showMentions && filteredMentionUsers.length > 0 && (
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 30, minWidth: '200px', maxHeight: '150px', overflowY: 'auto' }}>
                    {filteredMentionUsers.map(u => (
                      <div 
                        key={u} 
                        onClick={() => insertMention(u)}
                        style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        className="hover:bg-slate-800"
                      >
                        <User size={16} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{u}</span>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={isUploading ? "Đang tải tệp lên..." : (isConnected ? "Nhập tin nhắn..." : "Đang kết nối...")}
                  disabled={!isConnected || isUploading}
                  style={{ width: '100%', padding: '12px 16px', fontSize: '15px', borderRadius: '9999px', border: '1px solid var(--border-input)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || !isConnected || isUploading}
                style={{ padding: '12px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--accent)', color: '#0b1f28', cursor: (!inputValue.trim() || !isConnected || isUploading) ? 'not-allowed' : 'pointer', opacity: (!inputValue.trim() || !isConnected || isUploading) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Send size={20} style={{ marginLeft: '4px' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.18s ease'
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes imgPop { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
          `}</style>
          <button
            onClick={() => setLightboxUrl(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '22px',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s'
            }}
            title="Đóng"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="Xem ảnh"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              animation: 'imgPop 0.2s ease',
              cursor: 'default'
            }}
          />
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <div style={{ position: 'relative' }} className="group">
          {/* Subtle pulse ring behind the button */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' }}></div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', 
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <MessageCircle size={32} />
          </button>
          
          {/* Unread Messages Badge (Red Dot with Number) */}
          {unreadCount > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '9999px',
                padding: '2px 6px',
                minWidth: '20px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '3px solid var(--bg-body)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 11,
                animation: 'bounce 1s infinite'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
