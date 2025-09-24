import { useState, useEffect } from "react";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { toast } from "@/hooks/use-toast";
import { CheckSquare, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: "open" | "done";
  created_at: string;
  user_id: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "错误",
        description: "登出失败",
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(task => ({
        ...task,
        status: task.status as "open" | "done"
      })));
    } catch (error: any) {
      toast({
        title: "错误",
        description: "获取任务列表失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "user_id">) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          status: taskData.status,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [{
        ...data,
        status: data.status as "open" | "done"
      }, ...prev]);
      
      toast({
        title: "成功",
        description: "任务创建成功",
      });
    } catch (error: any) {
      toast({
        title: "错误", 
        description: "创建任务失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, title } : task
        )
      );

      toast({
        title: "成功",
        description: "任务更新成功",
      });
    } catch (error: any) {
      toast({
        title: "错误",
        description: "更新任务失败", 
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newStatus = task.status === "done" ? "open" : "done";

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "成功",
        description: `任务已${newStatus === "done" ? "完成" : "重新开启"}`,
      });
    } catch (error: any) {
      toast({
        title: "错误",
        description: "更新状态失败",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));

      toast({
        title: "成功",
        description: "任务删除成功",
      });
    } catch (error: any) {
      toast({
        title: "错误",
        description: "删除任务失败",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckSquare className="h-10 w-10 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Task Manager
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <p className="text-xl text-muted-foreground">
              欢迎，{user?.email}
            </p>
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            高效管理您的任务，提升工作效率
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Task Form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="h-5 w-5 text-success" />
                <h2 className="text-xl font-semibold">新增任务</h2>
              </div>
              <TaskForm onSubmit={createTask} loading={loading} />
            </div>
          </div>

          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up">
              <h2 className="text-xl font-semibold mb-6">任务列表</h2>
              <TaskList 
                tasks={tasks}
                loading={loading}
                onUpdate={updateTask}
                onToggleStatus={updateStatus}
                onDelete={deleteTask}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;