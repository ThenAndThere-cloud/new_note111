import { useState, useRef, useEffect } from 'react';
import { Message, ChatHistory } from '../types/chat';
import { chatWithLLM } from '../lib/llm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface ChatbotProps {
  context?: string;
}

export function Chatbot({ context }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Chatbot 组件已加载，上下文:', context);
  }, [context]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log('用户发送消息:', input);
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('开始调用 LLM...');
      const response = await chatWithLLM([...messages, userMessage], context);
      console.log('收到 LLM 响应:', response);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('聊天过程中发生错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => {
            console.log('打开聊天面板');
            setIsOpen(true);
          }}
          className="rounded-full w-12 h-12 p-0"
          variant="outline"
        >
          💬
        </Button>
      ) : (
        <div className="w-96 bg-white rounded-lg shadow-lg border">
          <div className="flex justify-between items-center p-2 border-b">
            <h3 className="font-semibold">AI 助手</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('关闭聊天面板');
                setIsOpen(false);
              }}
            >
              ×
            </Button>
          </div>
          
          <ScrollArea className="h-96 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '发送中...' : '发送'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 