import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "./Dashboard";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onAddMessage: (message: ChatMessage) => void;
  isTestMode: boolean;
}

export const ChatInterface = ({ chatHistory, onAddMessage, isTestMode }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [query]);

  const handleSendMessage = async () => {
    if (!query.trim() || !user || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: query.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    onAddMessage(userMessage);
    
    const currentQuery = query.trim();
    setQuery("");
    setLoading(true);

    try {
      // Call webhook for AI response
      const baseUrl = isTestMode ? 'https://threepoy.app.n8n.cloud/webhook-test' : 'https://threepoy.app.n8n.cloud/webhook';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentQuery,
          user_id: user.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.response || data.message || "抱歉，我无法处理您的请求。",
        timestamp: new Date()
      };

      onAddMessage(aiMessage);
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message || "无法发送消息，请稍后重试",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "抱歉，我现在无法回答您的问题。请检查网络连接后重试。",
        timestamp: new Date()
      };

      onAddMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">开始智能111对话</h3>
            <p className="text-muted-foreground text-sm">
              上传各种格式文档后，向我询问文档相关的问题
            </p>
          </div>
        ) : (
          <>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <Card className={cn(
                  "max-w-[80%] border-border/50",
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50"
                )}>
                  <CardContent className="p-3">
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === "user" 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {formatTime(message.timestamp)}
                    </div>
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <Card className="bg-secondary/50 border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI正在思考中...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!query.trim() || loading}
            size="lg"
            className="px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};
