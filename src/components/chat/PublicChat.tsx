import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useGameStore } from '../../stores/gameStore';
import { useSocketStore } from '../../stores/socketStore';
import type { ChatMessage as ChatMessageType } from '../../types/index';

export const PublicChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { currentGame, currentPlayer } = useGameStore();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message: ChatMessageType) => {
      setMessages((prev) => [...prev, message]);

      // Increment unread count if chat is minimized
      if (isMinimized && message.senderId !== currentPlayer?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Listen for typing indicators
    const handleTypingIndicator = (data: {
      playerId: string;
      playerName: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping && data.playerId !== currentPlayer?.id) {
          newSet.add(data.playerName);
        } else {
          newSet.delete(data.playerName);
        }
        return newSet;
      });
    };

    // Listen for message history
    const handleMessageHistory = (messageHistory: ChatMessageType[]) => {
      setMessages(messageHistory);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_indicator', handleTypingIndicator);
    socket.on('message_history', handleMessageHistory);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_indicator', handleTypingIndicator);
      socket.off('message_history', handleMessageHistory);
    };
  }, [socket, currentPlayer?.id, isMinimized]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  useEffect(() => {
    // Clear unread count when chat is expanded
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMessageSent = () => {
    // Scroll to bottom after sending a message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const getTypingIndicatorText = (): string => {
    const typingArray = Array.from(typingUsers);
    if (typingArray.length === 0) return '';
    if (typingArray.length === 1) return `${typingArray[0]} is typing...`;
    if (typingArray.length === 2)
      return `${typingArray[0]} and ${typingArray[1]} are typing...`;
    return `${typingArray.length} people are typing...`;
  };

  if (!currentGame) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-80 md:w-96 bg-mystery-dark border border-gray-600 rounded-lg shadow-xl z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
        onClick={handleToggleMinimize}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold text-mystery-light">Group Chat</h3>
          {currentGame.players && (
            <span className="text-sm text-gray-400">
              ({currentGame.players.length} players)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(!isVisible);
            }}
            variant="ghost"
            size="sm"
          >
            {isVisible ? '✕' : '💬'}
          </Button>
          <Button onClick={handleToggleMinimize} variant="ghost" size="sm">
            {isMinimized ? '⬆️' : '⬇️'}
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="h-80 overflow-y-auto p-4 space-y-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">💬</span>
                <p className="text-gray-400 text-sm">No messages yet</p>
                <p className="text-gray-500 text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentPlayer?.id}
                  showTimestamp={true}
                />
              ))
            )}

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-400 italic">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span>{getTypingIndicatorText()}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput
            placeholder="Send a message to all players..."
            onMessageSent={handleMessageSent}
          />
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">💬</span>
            <span className="text-mystery-light">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount} new
              </span>
            )}
          </div>
          {typingUsers.size > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {getTypingIndicatorText()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
