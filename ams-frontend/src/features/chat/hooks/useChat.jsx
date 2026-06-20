import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from '../../../store/authStore';
import { getAuthToken } from '../../../lib/apiClient';

const CHAT_HISTORY_API = 'http://localhost:8080/api/chat/history';
const WS_ENDPOINT = 'http://localhost:8080/ws-notifications';

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const stompClientRef = useRef(null);

  // Load history
  useEffect(() => {
    fetch(`${CHAT_HISTORY_API}?limit=50`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
        setIsHistoryLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
        setIsHistoryLoaded(true); // Still mark as loaded so new msgs can be received
      });
  }, []);

  // Connect WebSocket
  useEffect(() => {
    if (!user) return;

    const token = getAuthToken();

    const stompClient = new Client({
      // We use webSocketFactory because SockJS is needed for fallback/compatibility with Spring
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      setIsConnected(true);
      
      // Subscribe to public chat topic
      stompClient.subscribe('/topic/public', (messageOutput) => {
        const receivedMessage = JSON.parse(messageOutput.body);
        setMessages((prevMessages) => {
          // Prevent duplicates if needed
          if (prevMessages.find(m => m.id === receivedMessage.id)) return prevMessages;
          return [...prevMessages, receivedMessage];
        });
      });

      // Subscribe to emoji reactions
      stompClient.subscribe('/topic/reactions', (messageOutput) => {
        const reactionEvent = JSON.parse(messageOutput.body);
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === reactionEvent.messageId) {
              return {
                ...msg,
                reactions: reactionEvent.reactions
              };
            }
            return msg;
          });
        });
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.onDisconnect = () => {
      setIsConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user]);

  const sendMessage = useCallback((content, type = 'TEXT', mediaUrl = null, replyToId = null, replyToContent = null, replyToSender = null) => {
    if (stompClientRef.current && isConnected && user) {
      const messageDto = {
        content: content,
        senderName: user.username,
        senderRole: user.role,
        type: type,
        mediaUrl: mediaUrl,
        timestamp: new Date().toISOString(),
        replyToId: replyToId,
        replyToContent: replyToContent,
        replyToSender: replyToSender
      };
      
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageDto)
      });
    }
  }, [isConnected, user]);

  const sendReaction = useCallback((messageId, emoji) => {
    if (stompClientRef.current && isConnected && user) {
      const reactionDto = {
        messageId: messageId,
        username: user.username,
        emoji: emoji
      };
      
      stompClientRef.current.publish({
        destination: '/app/chat.react',
        body: JSON.stringify(reactionDto)
      });
    }
  }, [isConnected, user]);

  return { messages, sendMessage, sendReaction, isConnected, isHistoryLoaded };
}

