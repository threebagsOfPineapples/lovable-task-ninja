import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FileManager } from "./FileManager";
import { ChatInterface } from "./ChatInterface";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "退出失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功退出",
        description: "您已成功退出登录",
      });
    }
  };

  const addMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearChat = () => {
    setChatHistory([]);
    toast({
      title: "聊天已清空",
      description: "聊天记录已成功清除",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="bg-gradient-card border-b border-border/50 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                文档聊天助手
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          {/* File Manager */}
          <div className="bg-gradient-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up">
            <h2 className="text-xl font-semibold mb-6">文件管理</h2>
            <FileManager />
          </div>

          {/* Chat Interface */}
          <div className="bg-gradient-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">智能问答</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                清空聊天
              </Button>
            </div>
            <ChatInterface 
              chatHistory={chatHistory}
              onAddMessage={addMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;