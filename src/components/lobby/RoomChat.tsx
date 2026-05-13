'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AVATAR_OPTIONS } from '@/lib/constants';

interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: number;
}

interface RoomChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  currentPlayerId: string;
}

export default function RoomChat({ messages, onSend, currentPlayerId }: RoomChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <ScrollArea className="flex-1 px-3">
        <div ref={scrollRef} className="space-y-2 py-2">
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-4">
              No messages yet — say hello!
            </p>
          )}
          {messages.map((msg) => {
            const isSystem = msg.playerId === 'system';
            const isSelf = msg.playerId === currentPlayerId;
            const avatarEmoji = AVATAR_OPTIONS.find((a) => a.id === msg.avatar)?.emoji ?? '👤';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-slate-400 italic">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                  {avatarEmoji}
                </span>
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 ${
                    isSelf
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${isSelf ? 'text-amber-100' : 'text-slate-500'}`}>
                      {msg.nickname}
                    </span>
                    <span className={`text-[10px] ${isSelf ? 'text-amber-200' : 'text-slate-400'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5 break-words">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t bg-white">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1"
          maxLength={200}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
