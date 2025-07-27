import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { socketService } from '../../services/socketService';
import { useGameStore } from '../../stores/gameStore';

interface ChatInputProps {
  isPrivate?: boolean;
  recipientId?: string;
  recipientName?: string;
  placeholder?: string;
  onMessageSent?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isPrivate = false,
  recipientId,
  recipientName,
  placeholder,
  onMessageSent,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { setError } = useGameStore();

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    // Handle typing indicators
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTypingIndicator(
        true,
        isPrivate ? recipientId : undefined
      );
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.sendTypingIndicator(
          false,
          isPrivate ? recipientId : undefined
        );
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, isPrivate, recipientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    const messageContent = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      if (isPrivate && recipientId) {
        await socketService.sendPrivateMessage(recipientId, messageContent);
      } else {
        await socketService.sendPublicMessage(messageContent);
      }

      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      setMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
      setIsTyping(false);
      socketService.sendTypingIndicator(
        false,
        isPrivate ? recipientId : undefined
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholderText = (): string => {
    if (placeholder) return placeholder;
    if (isPrivate && recipientName)
      return `Send a private message to ${recipientName}...`;
    if (isPrivate) return 'Send a private message...';
    return 'Type your message...';
  };

  return (
    <div className="border-t border-gray-700 bg-mystery-purple p-4">
      {/* Private chat indicator */}
      {isPrivate && recipientName && (
        <div className="flex items-center space-x-2 mb-3 text-sm">
          <span className="text-red-400">🔒</span>
          <span className="text-gray-300">Private conversation with</span>
          <span className="text-mystery-gold font-medium">{recipientName}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-4 py-3 text-mystery-light placeholder-gray-500 resize-none focus:outline-none focus:border-mystery-gold transition-colors"
            rows={1}
            maxLength={500}
            disabled={isSending}
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {isTyping && <span className="text-mystery-gold">Typing...</span>}
            </div>
            <span className={message.length > 450 ? 'text-yellow-400' : ''}>
              {message.length}/500
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <Button
            type="submit"
            disabled={!message.trim() || isSending}
            isLoading={isSending}
            className="px-6"
          >
            {isSending ? '⏳' : '📤'}
          </Button>
        </div>
      </form>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          onClick={() => setMessage((prev) => prev + '🤔 I think... ')}
          variant="ghost"
          size="sm"
          disabled={isSending}
        >
          🤔 Theory
        </Button>
        <Button
          onClick={() => setMessage((prev) => prev + '❓ Can you explain... ')}
          variant="ghost"
          size="sm"
          disabled={isSending}
        >
          ❓ Question
        </Button>
        <Button
          onClick={() =>
            setMessage((prev) => prev + '🔍 I found evidence that... ')
          }
          variant="ghost"
          size="sm"
          disabled={isSending}
        >
          🔍 Evidence
        </Button>
        {isPrivate && (
          <Button
            onClick={() =>
              setMessage((prev) => prev + '🤫 I need to tell you something... ')
            }
            variant="ghost"
            size="sm"
            disabled={isSending}
          >
            🤫 Secret
          </Button>
        )}
      </div>
    </div>
  );
};
