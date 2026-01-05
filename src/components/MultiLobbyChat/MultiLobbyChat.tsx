import { User } from 'firebase/auth';
import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';
import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Socket } from 'socket.io-client';
import { DEFAULT_PFP_URL } from '../../constants/defaults';
import { MultiLobby } from '../../types/jingle';

import styles from './MultiLobbyChat.module.css';

enum ProfanityFilterOptions {
  on = 'on',
  off = 'off',
}
const MultiLobbyChat = ({
  socket,
  lobby,
  currentUser,
}: {
  socket: Socket;
  lobby: MultiLobby;
  currentUser: User;
}) => {
  const profanityFilterPreference = localStorage.getItem('profanityFilter');
  const [profanityFilterOn, setProfanityFilterOn] = useState(
    profanityFilterPreference === undefined ||
      profanityFilterPreference === ProfanityFilterOptions.on,
  );
  console.log('RERENDER', profanityFilterOn);

  const currentUserId = currentUser?.uid;
  const lobbyId = lobby?.id;

  const handleProfanityFilterToggle = () => {
    setProfanityFilterOn((prev) => {
      if (prev === false) {
        localStorage.setItem('profanityFilter', ProfanityFilterOptions.on);
        return true;
      } else {
        localStorage.setItem('profanityFilter', ProfanityFilterOptions.off);
        return false;
      }
    });
  };

  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const censor = new TextCensor();

  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      userId: string;
      username: string;
      avatarUrl?: string;
      message: string;
      timestamp: number;
    }>
  >([]);

  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !socket || !currentUser || !lobbyId) return;

    const message = chatInput.trim();

    // Send via WebSocket
    socket.emit('chat-message', {
      lobbyId,
      userId: currentUser.uid,
      username: currentUser.displayName || 'Anonymous',
      avatarUrl: currentUser.photoURL || undefined,
      message,
    });

    setChatInput('');
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Chat WebSocket handling
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: {
      id: string;
      userId: string;
      username: string;
      avatarUrl?: string;
      message: string;
      timestamp: number;
    }) => {
      if (profanityFilterOn) {
        const phrase = data.message;
        const matches = matcher.getAllMatches(phrase);
        const censoredText = censor.applyTo(phrase, matches);
        data.message = censoredText;
      }
      setChatMessages((prev) => [...prev, data]);
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, lobbyId, profanityFilterOn, censor, matcher]);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  return (
    <>
      <div>
        {/* ... existing UI ... */}

        {/* Add chat sidebar */}
        <aside className={styles.chatContainer}>
          <div className={`${styles.chatHeader}`}>
            <h3>
              Lobby Chat
              <FaChevronDown
                onClick={toggleChat}
                className={chatOpen ? '' : 'rotated'}
              />
            </h3>
            <span>
              <span
                className={`${styles.profanityToggle} ${
                  profanityFilterOn ? `${styles.profanityToggleOn}` : `${styles.profanityToggleOff}`
                }`}
                onClick={handleProfanityFilterToggle}
              >
                🤬
              </span>
              <span className={styles.onlineCount}>{lobby?.players?.length || 0} online</span>
            </span>
          </div>
          <div
            ref={chatContainerRef}
            className={
              chatOpen ? `${styles.chatMessages}` : `${styles.chatMessages} ${styles.chatClosed}`
            }
          >
            {chatMessages.map((msg) => {
              const isCurrentUser = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`${styles.chatMessage} ${isCurrentUser ? styles.userMessage : ''}`}
                >
                  <div className={styles.chatMessageHeader}>
                    {msg.avatarUrl ? (
                      <img
                        src={msg.avatarUrl}
                        alt={msg.username}
                        className={styles.chatAvatar}
                      />
                    ) : (
                      <img
                        src={DEFAULT_PFP_URL}
                        alt={msg.username}
                        className={styles.chatAvatar}
                      />
                    )}
                    <span className={styles.chatUsername}>{msg.username}</span>
                    <span className={styles.chatTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className={styles.chatMessageText}>{msg.message}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.chatInputContainer}>
            <input
              type='text'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder='Type a message...'
              className={styles.chatInput}
              maxLength={200}
            />
            <button
              onClick={handleSendChatMessage}
              className={styles.chatSendButton}
              disabled={!chatInput.trim()}
            >
              Send
            </button>
          </div>
        </aside>

        {/* ... rest of your UI ... */}
      </div>
    </>
  );
};

export default MultiLobbyChat;
