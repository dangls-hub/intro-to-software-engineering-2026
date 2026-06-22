import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, User, Paperclip, FileText, FileArchive, FileCode, File, Download, Trash2, Pin } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../../store/authStore';
import { useTheme } from '../../../store/themeStore';
import { getAuthToken } from '../../../lib/apiClient';

// Link preview component and cache
const linkPreviewCache = {};

function getFirstUrl(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

function LinkPreview({ url }) {
  const [preview, setPreview] = useState(linkPreviewCache[url] || null);
  const [loading, setLoading] = useState(!linkPreviewCache[url]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (preview || linkPreviewCache[url]) {
      return;
    }
    
    let active = true;
    setLoading(true);
    setError(false);

    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (active && data && data.status === 'success' && data.data) {
          const info = {
            title: data.data.title,
            description: data.data.description,
            imageUrl: data.data.image?.url,
            logoUrl: data.data.logo?.url,
            publisher: data.data.publisher || new URL(url).hostname
          };
          linkPreviewCache[url] = info;
          setPreview(info);
        }
      })
      .catch(err => {
        console.error('Error fetching link preview:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url, preview]);

  if (loading) {
    return (
      <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', width: '240px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', flexShrink: 0 }}></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '80%' }}></div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '50%' }}></div>
        </div>
      </div>
    );
  }

  if (error || !preview) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        marginTop: '8px',
        display: 'block',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(0,0,0,0.15)',
        textDecoration: 'none',
        color: 'inherit',
        maxWidth: '240px',
        transition: 'background 0.2s'
      }}
      className="hover:bg-black/20"
    >
      {preview.imageUrl && (
        <img
          src={preview.imageUrl}
          alt={preview.title}
          style={{ width: '100%', height: '100px', objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        />
      )}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {preview.logoUrl && (
            <img src={preview.logoUrl} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '9px', opacity: 0.65, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {preview.publisher}
          </span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginBottom: '2px', lineHeight: '1.2' }}>
          {preview.title}
        </div>
        {preview.description && (
          <div style={{ fontSize: '9px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}

export default function ChatWidget() {
  const { theme } = useTheme();
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
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeEmojiMessageId, setActiveEmojiMessageId] = useState(null);
  const [recallModalTarget, setRecallModalTarget] = useState(null);
  const [recallOption, setRecallOption] = useState('everyone');
  const [pinModalTarget, setPinModalTarget] = useState(null);
  const [showPinnedListModal, setShowPinnedListModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiTimeoutRef = useRef(null);
  
  const { messages, sendMessage, sendReaction, recallMessage, hideMessage, togglePin, isConnected, isHistoryLoaded } = useChat();
  const { user } = useAuth();

  const isDark = theme === 'dark';
  const modalStyles = {
    overlayBg: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.4)',
    cardBg: isDark ? '#242526' : '#ffffff',
    cardBorder: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
    cardShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.5)' : '0 12px 36px rgba(0, 0, 0, 0.12)',
    textColor: isDark ? '#e4e6eb' : '#050505',
    subTextColor: isDark ? '#b0b3b8' : '#65676b',
    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
    closeBtnBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    closeBtnColor: isDark ? '#b0b3b8' : '#65676b',
    radioBorderColor: isDark ? '#a8abaf' : '#bcc0c4',
    footerBg: isDark ? '#242526' : '#ffffff'
  };

  const openPinnedList = () => {
    fetch('http://localhost:8080/api/chat/pinned', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPinnedMessages(data);
          setShowPinnedListModal(true);
        }
      })
      .catch(err => console.error('Failed to fetch pinned messages', err));
  };

  const handleEmojiMouseEnter = (msgId) => {
    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current);
      emojiTimeoutRef.current = null;
    }
    setActiveEmojiMessageId(msgId);
  };

  const handleEmojiMouseLeave = () => {
    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current);
    }
    emojiTimeoutRef.current = setTimeout(() => {
      setActiveEmojiMessageId(null);
    }, 250); // 250ms is perfect for quick mouse travel
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emojiTimeoutRef.current) clearTimeout(emojiTimeoutRef.current);
    };
  }, []);

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
      // If the recall, pin, or pinned list modals are active, do not close the chat window
      if (
        document.getElementById('ams-recall-modal') ||
        document.getElementById('ams-pin-modal') ||
        document.getElementById('ams-pinned-list-modal')
      ) {
        return;
      }
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
      sendMessage(
        inputValue.trim(),
        'TEXT',
        null,
        replyingTo?.id,
        replyingTo ? (replyingTo.type === 'IMAGE' ? '[Hình ảnh]' : replyingTo.type === 'VIDEO' ? '[Video]' : replyingTo.type === 'FILE' ? `[Tệp] ${replyingTo.content}` : replyingTo.content) : null,
        replyingTo?.senderName
      );
      setInputValue('');
      setReplyingTo(null);
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
  const filteredMentionUsers = [...systemUsers, 'bluemoon']
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
    if (role === 'AI_BOT') return 'text-violet-600 font-extrabold';
    return 'text-blue-600 font-semibold';
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-1">BQL</span>;
    if (role === 'STAFF') return <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded ml-1">NV</span>;
    if (role === 'AI_BOT') return <span className="text-[10px] bg-violet-100 text-violet-600 px-1 rounded ml-1 font-bold">🤖 TRỢ LÝ AI</span>;
    return null;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Detect URLs, Markdown bold/italic, lists, code in text and render them
  const renderMessageContent = (text) => {
    if (!text) return null;

    // Split by code blocks first
    const blocks = text.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, index) => {
      if (block.startsWith('```') && block.endsWith('```')) {
        const code = block.substring(3, block.length - 3).trim();
        return (
          <pre 
            key={index} 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.15)', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              overflowX: 'auto',
              margin: '6px 0',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'pre-wrap'
            }}
          >
            <code>{code}</code>
          </pre>
        );
      }

      // Now process inline bold, italic, code, list items, and newlines
      const lines = block.split('\n');
      return (
        <div key={index}>
          {lines.map((line, lineIdx) => {
            let content = line;
            
            // Check for bullet list item
            const isListItem = content.startsWith('- ') || content.startsWith('* ');
            if (isListItem) {
              content = content.substring(2);
            }

            // Render inline elements: **bold**, *italic*, `code`, and URL links
            const parts = [];
            const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|https?:\/\/[^\s]+)/g;
            const splitParts = content.split(regex);

            splitParts.forEach((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                parts.push(<strong key={partIdx}>{part.substring(2, part.length - 2)}</strong>);
              } else if (part.startsWith('*') && part.endsWith('*')) {
                parts.push(<em key={partIdx}>{part.substring(1, part.length - 1)}</em>);
              } else if (part.startsWith('`') && part.endsWith('`')) {
                parts.push(
                  <code 
                    key={partIdx} 
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', 
                      padding: '2px 4px', 
                      borderRadius: '4px', 
                      fontFamily: 'monospace', 
                      fontSize: '12px' 
                    }}
                  >
                    {part.substring(1, part.length - 1)}
                  </code>
                );
              } else if (/^https?:\/\//.test(part)) {
                parts.push(
                  <a
                    key={partIdx}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      opacity: 0.85,
                      wordBreak: 'break-all'
                    }}
                  >
                    {part}
                  </a>
                );
              } else {
                parts.push(part);
              }
            });

            if (isListItem) {
              return (
                <ul key={lineIdx} style={{ margin: '2px 0 2px 16px', padding: 0, listStyleType: 'disc' }}>
                  <li>{parts}</li>
                </ul>
              );
            }

            return (
              <p key={lineIdx} style={{ margin: 0, minHeight: lineIdx > 0 ? '4px' : '0' }}>
                {parts}
              </p>
            );
          })}
        </div>
      );
    });
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
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={openPinnedList} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center' }}
                  className="hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="Tin nhắn đã ghim"
                >
                  <Pin size={18} />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="ams-chat-messages" style={{ position: 'absolute', top: '60px', bottom: replyingTo ? '120px' : '80px', left: 0, right: 0, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 10, backgroundColor: 'transparent' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginTop: '40px' }}>
                  Chưa có tin nhắn nào. Hãy là người đầu tiên!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.type === 'SYSTEM') {
                    const isPin = msg.content.includes(' đã ghim một tin nhắn.');
                    const pinner = isPin 
                      ? msg.content.split(' đã ghim một tin nhắn.')[0] 
                      : msg.content.split(' đã bỏ ghim một tin nhắn.')[0];
                    const displayName = pinner === user.username ? 'Bạn' : pinner;
                    
                    return (
                      <div 
                        key={msg.id || idx}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          width: '100%', 
                          margin: '8px 0',
                          padding: '0 16px',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)', 
                          textAlign: 'center',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          padding: '6px 14px',
                          borderRadius: '16px',
                          border: '1px solid var(--border-subtle)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{isPin ? '📌' : '📍'}</span>
                          <span>
                            {displayName} đã {isPin ? 'ghim' : 'bỏ ghim'} một tin nhắn.
                            {isPin && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={openPinnedList}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0, 
                                    color: 'var(--accent)', 
                                    fontWeight: 600, 
                                    cursor: 'pointer', 
                                    textDecoration: 'underline' 
                                  }}
                                >
                                  Xem tất cả
                                </button>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = msg.senderName === user.username;
                  const isFirstInGroup = idx === 0 || messages[idx - 1].senderName !== msg.senderName;
                  const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].senderName !== msg.senderName;
                  const isWide = msg.type === 'IMAGE' || msg.type === 'VIDEO' || msg.type === 'FILE' || (msg.content && msg.content.length > 12);
                  const referencedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
                  const isReferencedMsgRecalled = referencedMsg?.recalled;
                  const displayReplyContent = isReferencedMsgRecalled ? 'Tin nhắn đã bị thu hồi' : msg.replyToContent;
                  
                  return (
                    <div 
                      key={msg.id || idx} 
                      id={`msg-${msg.id}`}
                      onMouseEnter={() => setHoveredMessageId(msg.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        flexShrink: 0, 
                        alignItems: isMe ? 'flex-end' : 'flex-start', 
                        marginTop: isFirstInGroup && idx > 0 ? '12px' : '0px',
                        position: 'relative',
                        width: '100%' 
                      }}
                    >
                      {!isMe && isFirstInGroup && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', marginLeft: '2px' }}>
                          <span className={getRoleColor(msg.senderRole)} style={{ fontSize: '12px' }}>
                            {msg.senderName}
                          </span>
                          {getRoleBadge(msg.senderRole)}
                        </div>
                      )}

                      {msg.pinned && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '10px', 
                          color: isDark ? '#f59e0b' : '#d97706', 
                          marginBottom: '2px',
                          marginLeft: isMe ? 0 : '12px',
                          marginRight: isMe ? '12px' : 0,
                          alignSelf: isMe ? 'flex-end' : 'flex-start'
                        }}>
                          <Pin size={10} fill={isDark ? '#f59e0b' : '#d97706'} style={{ transform: 'rotate(45deg)' }} />
                          <span style={{ fontWeight: 600 }}>Đã ghim</span>
                        </div>
                      )}
                      
                      {/* Bubble + Hover actions row */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        width: '100%',
                        position: 'relative',
                        gap: '6px'
                      }}>
                        {/* Actions for current user (appears to the left of their own bubble) */}
                        {isMe && hoveredMessageId === msg.id && msg.id && !msg.recalled && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--bg-card-solid)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '2px 6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 15
                          }}>
                            {/* Pin / Unpin button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.pinned) {
                                  togglePin(msg.id);
                                } else {
                                  setPinModalTarget(msg);
                                }
                              }}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: msg.pinned ? '#eab308' : 'var(--text-muted)' }}
                              className="hover:scale-110 transition-transform"
                              title={msg.pinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
                            >
                              <Pin size={13} fill={msg.pinned ? "#eab308" : "none"} />
                            </button>
                            {/* Recall button */}
                            <button
                              type="button"
                              onClick={() => {
                                setRecallModalTarget(msg);
                                setRecallOption('everyone');
                              }}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                              className="hover:text-red-500 transition-colors"
                              title="Thu hồi tin nhắn"
                            >
                              <Trash2 size={13} />
                            </button>
                            {/* Reaction trigger */}
                            <div 
                              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={() => handleEmojiMouseEnter(msg.id)}
                              onMouseLeave={handleEmojiMouseLeave}
                            >
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', fontSize: '14px', filter: 'grayscale(0.3)' }}
                                className="hover:scale-125 transition-transform"
                                title="Bày tỏ cảm xúc"
                              >
                                😊
                              </button>
                              {activeEmojiMessageId === msg.id && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '26px',
                                  left: isWide ? '-10px' : 'auto',
                                  right: isWide ? 'auto' : '-10px',
                                  display: 'flex',
                                  gap: '6px',
                                  backgroundColor: 'var(--bg-card-solid)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '20px',
                                  padding: '4px 8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                  zIndex: 25,
                                  animation: 'fadeIn 0.1s ease-out'
                                }}>
                                  {['👍', '❤️', '😂', '😮', '😢', '👎'].map(emoji => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        sendReaction(msg.id, emoji);
                                        setActiveEmojiMessageId(null);
                                      }}
                                      style={{ fontSize: '16px', background: 'none', border: 'none', padding: '1px', cursor: 'pointer' }}
                                      className="hover:scale-130 active:scale-95 transition-transform"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Reply button */}
                            <button
                              type="button"
                              onClick={() => setReplyingTo(msg)}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                              className="hover:text-sky-400"
                              title="Trả lời"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 17 4 12 9 7"></polyline>
                                <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                              </svg>
                            </button>
                          </div>
                        )}

                        <div
                          style={{
                            padding: (msg.type !== 'TEXT' && !msg.content && !msg.recalled) ? '0' : '7px 12px',
                            fontSize: '14px',
                            lineHeight: 1.3,
                            maxWidth: '80%',
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            backgroundColor: msg.recalled ? 'transparent' : (
                              isMe ? 'var(--accent)' : (
                                msg.senderName === 'BlueMoon AI'
                                  ? (isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)')
                                  : 'var(--bg-card-solid)'
                              )
                            ),
                            color: msg.recalled ? 'var(--text-muted)' : (isMe ? '#0b1f28' : 'var(--text-primary)'),
                            border: msg.recalled ? '1px dashed var(--border)' : (
                              isMe ? 'none' : (
                                msg.senderName === 'BlueMoon AI'
                                  ? '1px solid rgba(139, 92, 246, 0.45)'
                                  : '1px solid var(--border)'
                              )
                            ),
                            fontStyle: msg.recalled ? 'italic' : 'normal',
                            borderRadius: isMe
                              ? `18px ${isFirstInGroup ? '18px' : '4px'} ${isLastInGroup ? '18px' : '4px'} 18px`
                              : `${isFirstInGroup ? '18px' : '4px'} 18px 18px ${isLastInGroup ? '18px' : '4px'}`,
                            fontWeight: msg.recalled ? 400 : (isMe ? 500 : 400),
                            overflow: 'hidden'
                          }}
                        >
                          {/* Referenced Quote Block */}
                          {msg.replyToId && (
                            <div 
                              onClick={() => {
                                const refEl = document.getElementById(`msg-${msg.replyToId}`);
                                if (refEl) {
                                  refEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  const originalBg = refEl.style.backgroundColor;
                                  refEl.style.backgroundColor = 'rgba(14, 165, 233, 0.25)';
                                  setTimeout(() => {
                                    refEl.style.backgroundColor = originalBg;
                                  }, 1200);
                                }
                              }}
                              style={{
                                fontSize: '11px',
                                opacity: 0.85,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: isMe ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
                                borderLeft: `3px solid ${isMe ? '#0b1f28' : 'var(--accent)'}`,
                                marginBottom: '6px',
                                cursor: 'pointer',
                                display: 'block',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none'
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '10px', marginBottom: '1px' }}>
                                {msg.replyToSender}
                              </div>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', fontStyle: isReferencedMsgRecalled ? 'italic' : 'normal' }}>
                                {displayReplyContent}
                              </div>
                            </div>
                          )}

                          {msg.recalled ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                              <span>🚫 Tin nhắn đã bị thu hồi</span>
                            </div>
                          ) : (
                            <>
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
                                  {renderMessageContent(msg.content)}
                                  {msg.type === 'TEXT' && getFirstUrl(msg.content) && (
                                    <LinkPreview url={getFirstUrl(msg.content)} />
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Actions for other users (appears to the right of their bubble) */}
                        {!isMe && hoveredMessageId === msg.id && msg.id && !msg.recalled && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--bg-card-solid)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '2px 6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 15
                          }}>
                            {/* Pin / Unpin button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.pinned) {
                                  togglePin(msg.id);
                                } else {
                                  setPinModalTarget(msg);
                                }
                              }}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: msg.pinned ? '#eab308' : 'var(--text-muted)' }}
                              className="hover:scale-110 transition-transform"
                              title={msg.pinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
                            >
                              <Pin size={13} fill={msg.pinned ? "#eab308" : "none"} />
                            </button>
                            {/* Hide button */}
                            <button
                              type="button"
                              onClick={() => {
                                setRecallModalTarget(msg);
                                setRecallOption('me');
                              }}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                              className="hover:text-red-500 transition-colors"
                              title="Gỡ ở phía bạn"
                            >
                              <Trash2 size={13} />
                            </button>

                            {/* Reaction trigger */}
                            <div 
                              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={() => handleEmojiMouseEnter(msg.id)}
                              onMouseLeave={handleEmojiMouseLeave}
                            >
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', fontSize: '14px', filter: 'grayscale(0.3)' }}
                                className="hover:scale-125 transition-transform"
                                title="Bày tỏ cảm xúc"
                              >
                                😊
                              </button>
                              {activeEmojiMessageId === msg.id && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '26px',
                                  left: isWide ? 'auto' : '-10px',
                                  right: isWide ? '-10px' : 'auto',
                                  display: 'flex',
                                  gap: '6px',
                                  backgroundColor: 'var(--bg-card-solid)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '20px',
                                  padding: '4px 8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                  zIndex: 25,
                                  animation: 'fadeIn 0.1s ease-out'
                                }}>
                                  {['👍', '❤️', '😂', '😮', '😢', '👎'].map(emoji => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        sendReaction(msg.id, emoji);
                                        setActiveEmojiMessageId(null);
                                      }}
                                      style={{ fontSize: '16px', background: 'none', border: 'none', padding: '1px', cursor: 'pointer' }}
                                      className="hover:scale-130 active:scale-95 transition-transform"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Reply button */}
                            <button
                              type="button"
                              onClick={() => setReplyingTo(msg)}
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                              className="hover:text-sky-400"
                              title="Trả lời"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 17 4 12 9 7"></polyline>
                                <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reaction Badges */}
                      {!msg.recalled && msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '4px',
                          marginBottom: '2px',
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          paddingLeft: isMe ? '0' : '8px',
                          paddingRight: isMe ? '8px' : '0'
                        }}>
                          {Object.entries(msg.reactions).map(([emoji, users]) => {
                            if (!users || users.length === 0) return null;
                            const hasReacted = users.includes(user.username);
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => sendReaction(msg.id, emoji)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  backgroundColor: hasReacted ? 'rgba(14, 165, 233, 0.15)' : 'rgba(0,0,0,0.1)',
                                  border: hasReacted ? '1px solid rgba(14, 165, 233, 0.35)' : '1px solid var(--border)',
                                  borderRadius: '10px',
                                  padding: '1px 5px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  color: 'var(--text-primary)',
                                  transition: 'transform 0.1s ease',
                                  outline: 'none'
                                }}
                                className="hover:scale-105 active:scale-95"
                                title={users.join(', ')}
                              >
                                <span>{emoji}</span>
                                <span style={{ fontWeight: 600 }}>{users.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

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
            <form onSubmit={handleSend} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: replyingTo ? '120px' : '80px', padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 20, backgroundColor: 'var(--bg-card-solid)', borderTop: '1px solid var(--border)' }}>
              
              {replyingTo && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  borderLeft: '3px solid var(--accent)'
                }}>
                  <div style={{ flex: 1, minWidth: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      Trả lời {replyingTo.senderName}:
                    </span>{' '}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '200px', verticalAlign: 'bottom' }}>
                      {replyingTo.type === 'IMAGE' ? '[Hình ảnh]' : replyingTo.type === 'VIDEO' ? '[Video]' : replyingTo.type === 'FILE' ? `[Tệp] ${replyingTo.content}` : replyingTo.content}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    className="hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
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
                          {u === 'bluemoon' ? (
                            <span style={{ fontSize: '16px' }}>🤖</span>
                          ) : (
                            <User size={16} />
                          )}
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {u === 'bluemoon' ? 'bluemoon (BlueMoon AI)' : u}
                          </span>
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
                    style={{ width: '100%', padding: '10px 16px', fontSize: '14px', borderRadius: '9999px', border: '1px solid var(--border-input)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected || isUploading}
                  style={{ padding: '10px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--accent)', color: '#0b1f28', cursor: (!inputValue.trim() || !isConnected || isUploading) ? 'not-allowed' : 'pointer', opacity: (!inputValue.trim() || !isConnected || isUploading) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
              </div>
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

      {/* Custom Recall Confirmation Modal (Full Screen Overlay like Messenger) */}
      {recallModalTarget && (
        <div 
          id="ams-recall-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: modalStyles.overlayBg,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999, // Overlay everything
            animation: 'fadeIn 0.18s ease'
          }}
        >
          <div style={{
            width: '540px',
            maxWidth: '90vw',
            backgroundColor: modalStyles.cardBg,
            border: modalStyles.cardBorder,
            borderRadius: '16px',
            boxShadow: modalStyles.cardShadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: modalStyles.textColor,
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: modalStyles.borderBottom
            }}>
              <h4 style={{ fontWeight: 600, fontSize: '20px', margin: 0, color: modalStyles.textColor }}>
                Bạn muốn thu hồi tin nhắn này ở phía ai?
              </h4>
              <button
                type="button"
                onClick={() => setRecallModalTarget(null)}
                style={{ 
                  background: modalStyles.closeBtnBg, 
                  border: 'none', 
                  color: modalStyles.closeBtnColor, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%' 
                }}
                className={`${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content / Options */}
            <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Option 1: everyone */}
              {recallModalTarget.senderName === user.username && (
                <label 
                  className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} p-2 rounded-lg transition-colors duration-150`}
                  style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'flex-start' }}
                >
                  <input
                    type="radio"
                    name="recallOption"
                    checked={recallOption === 'everyone'}
                    onChange={() => setRecallOption('everyone')}
                    style={{ display: 'none' }}
                  />
                  {/* Custom styled radio button */}
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: recallOption === 'everyone' ? '2px solid #0084ff' : `2px solid ${modalStyles.radioBorderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: recallOption === 'everyone' ? '#0084ff' : 'transparent',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}>
                      {recallOption === 'everyone' && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff'
                        }} />
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: modalStyles.textColor }}>
                      Thu hồi với mọi người
                    </div>
                    <div style={{ fontSize: '13px', color: modalStyles.subTextColor, lineHeight: '1.4' }}>
                      Tin nhắn này sẽ bị thu hồi với mọi người trong đoạn chat. Những người khác có thể đã xem hoặc chuyển tiếp tin nhắn đó. Tin nhắn đã thu hồi vẫn có thể bị báo cáo.
                    </div>
                  </div>
                </label>
              )}

              {/* Option 2: me */}
              <label 
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} p-2 rounded-lg transition-colors duration-150`}
                style={{ display: 'flex', gap: '16px', cursor: 'pointer', alignItems: 'flex-start' }}
              >
                <input
                  type="radio"
                  name="recallOption"
                  checked={recallOption === 'me'}
                  onChange={() => setRecallOption('me')}
                  style={{ display: 'none' }}
                />
                {/* Custom styled radio button */}
                <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: recallOption === 'me' ? '2px solid #0084ff' : `2px solid ${modalStyles.radioBorderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: recallOption === 'me' ? '#0084ff' : 'transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}>
                    {recallOption === 'me' && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }} />
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: modalStyles.textColor }}>
                    Thu hồi với bạn
                  </div>
                  <div style={{ fontSize: '13px', color: modalStyles.subTextColor, lineHeight: '1.4' }}>
                    Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác trong đoạn chat.
                  </div>
                </div>
              </label>
            </div>

            {/* Footer / Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '12px 20px',
              backgroundColor: modalStyles.footerBg,
              borderTop: modalStyles.borderBottom
            }}>
              <button
                type="button"
                onClick={() => setRecallModalTarget(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#0084ff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (recallOption === 'everyone') {
                    recallMessage(recallModalTarget.id);
                  } else {
                    hideMessage(recallModalTarget.id);
                  }
                  setRecallModalTarget(null);
                }}
                style={{
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0084ff',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Gỡ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Pin Confirmation Modal */}
      {pinModalTarget && (
        <div 
          id="ams-pin-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: modalStyles.overlayBg,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            animation: 'fadeIn 0.18s ease'
          }}
        >
          <div style={{
            width: '540px',
            maxWidth: '90vw',
            backgroundColor: modalStyles.cardBg,
            border: modalStyles.cardBorder,
            borderRadius: '16px',
            boxShadow: modalStyles.cardShadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: modalStyles.textColor,
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: modalStyles.borderBottom
            }}>
              <h4 style={{ fontWeight: 600, fontSize: '18px', margin: 0, color: modalStyles.textColor }}>
                Ghim tin nhắn này?
              </h4>
              <button
                type="button"
                onClick={() => setPinModalTarget(null)}
                style={{ 
                  background: modalStyles.closeBtnBg, 
                  border: 'none', 
                  color: modalStyles.closeBtnColor, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%' 
                }}
                className={`${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'} transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px', color: modalStyles.textColor }}>
                Mọi người trong đoạn chat có thể xem tin nhắn đã ghim
              </div>
              <div style={{ fontSize: '13px', color: modalStyles.subTextColor, lineHeight: '1.4' }}>
                Bạn có thể xem và bỏ ghim tin nhắn qua phần chi tiết hoặc danh sách tin nhắn đã ghim.
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '12px 20px',
              backgroundColor: modalStyles.footerBg,
              borderTop: modalStyles.borderBottom
            }}>
              <button
                type="button"
                onClick={() => setPinModalTarget(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#0084ff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  togglePin(pinModalTarget.id);
                  setPinModalTarget(null);
                }}
                style={{
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0084ff',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Ghim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Messages List Modal */}
      {showPinnedListModal && (
        <div 
          id="ams-pinned-list-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: modalStyles.overlayBg,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            animation: 'fadeIn 0.18s ease'
          }}
        >
          <div style={{
            width: '540px',
            maxWidth: '90vw',
            height: '480px',
            maxHeight: '80vh',
            backgroundColor: modalStyles.cardBg,
            border: modalStyles.cardBorder,
            borderRadius: '16px',
            boxShadow: modalStyles.cardShadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: modalStyles.textColor,
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: modalStyles.borderBottom
            }}>
              <h4 style={{ fontWeight: 600, fontSize: '18px', margin: 0, color: modalStyles.textColor }}>
                Tin nhắn đã ghim
              </h4>
              <button
                type="button"
                onClick={() => setShowPinnedListModal(false)}
                style={{ 
                  background: modalStyles.closeBtnBg, 
                  border: 'none', 
                  color: modalStyles.closeBtnColor, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%' 
                }}
                className={`${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'} transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            {/* List Body */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '12px 16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px' 
            }} className="ams-pinned-list-container">
              <style>{`
                .ams-pinned-list-container::-webkit-scrollbar { width: 6px; }
                .ams-pinned-list-container::-webkit-scrollbar-track { background: transparent; }
                .ams-pinned-list-container::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.3); border-radius: 10px; }
              `}</style>
              
              {pinnedMessages.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  color: modalStyles.subTextColor,
                  gap: '8px'
                }}>
                  <Pin size={36} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: '14px' }}>Chưa có tin nhắn đã ghim nào</span>
                </div>
              ) : (
                pinnedMessages.map((msg) => {
                  const initial = msg.senderName ? msg.senderName.charAt(0).toUpperCase() : '?';
                  const isImage = msg.type === 'IMAGE';
                  const isVideo = msg.type === 'VIDEO';
                  const isFile = msg.type === 'FILE';
                  const shortTime = formatTime(msg.timestamp);
                  
                  let displayContent = msg.content;
                  if (msg.recalled) {
                    displayContent = 'Tin nhắn đã bị thu hồi';
                  } else if (isImage) {
                    displayContent = '[Hình ảnh]';
                  } else if (isVideo) {
                    displayContent = '[Video]';
                  } else if (isFile) {
                    displayContent = `[Tệp] ${msg.content}`;
                  }
                  
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        const targetEl = document.getElementById(`msg-${msg.id}`);
                        if (targetEl) {
                          setShowPinnedListModal(false);
                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // Highlight effect
                          const originalBg = targetEl.style.backgroundColor;
                          targetEl.style.backgroundColor = 'rgba(234, 179, 8, 0.25)';
                          setTimeout(() => {
                            targetEl.style.backgroundColor = originalBg;
                          }, 1500);
                        } else {
                          alert('Tin nhắn gốc nằm ngoài lịch sử hội thoại hiển thị hiện tại.');
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {/* Avatar */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: msg.senderName === 'BlueMoon AI' ? '#8b5cf6' : 'var(--accent)',
                          color: msg.senderName === 'BlueMoon AI' ? '#ffffff' : '#0b1f28',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {msg.senderName === 'BlueMoon AI' ? '🤖' : initial}
                        </div>
                        {/* Sender info & Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px', color: modalStyles.textColor }}>
                              {msg.senderName}
                            </span>
                            <span style={{ fontSize: '11px', color: modalStyles.subTextColor }}>
                              {shortTime}
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: msg.recalled ? modalStyles.subTextColor : 'var(--text-primary)',
                            fontStyle: msg.recalled ? 'italic' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px'
                          }}>
                            {displayContent}
                          </div>
                        </div>
                      </div>
                      
                      {/* Unpin Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(msg.id);
                          setPinnedMessages(prev => prev.filter(m => m.id !== msg.id));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px'
                        }}
                        className="hover:bg-red-500/10 transition-colors"
                      >
                        Bỏ ghim
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
