import { useState, useEffect } from "react";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { toast } from "@/hooks/use-toast";
import { CheckSquare, Plus } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: "open" | "done";
  created_at: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock JWT token - in real app this would come from auth
  const jwtToken = "your-jwt-token-here";

  const headers = {
    "Authorization": `Bearer ${jwtToken}`,
    "Content-Type": "application/json",
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API endpoint
      // const response = await fetch("/list-tasks", { headers });
      
      // Mock data for demonstration
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "完成项目文档",
          description: "编写技术文档和用户手册",
          due_date: "2024-02-15",
          status: "open",
          created_at: "2024-01-15T08:00:00Z"
        },
        {
          id: "2", 
          title: "代码审查",
          description: "审查新功能的代码实现",
          due_date: "2024-02-12",
          status: "done",
          created_at: "2024-01-14T09:30:00Z"
        }
      ];
      
      setTasks(mockTasks);
      setLoading(false);
    } catch (error) {
      toast({
        title: "错误",
        description: "获取任务列表失败",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, "id" | "created_at">) => {
    try {
      setLoading(true);
      // Simulate API call
      // const response = await fetch("/create-task", {
      //   method: "POST",
      //   headers,
      //   body: JSON.stringify({
      //     title: taskData.title,
      //     description: taskData.description,
      //     due_date: taskData.due_date
      //   })
      // });

      // Mock implementation
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      setTasks(prev => [newTask, ...prev]);
      setLoading(false);
      
      toast({
        title: "成功",
        description: "任务创建成功",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "错误", 
        description: "创建任务失败",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const updateTask = async (id: string, title: string) => {
    try {
      // Simulate API call
      // await fetch("/update-task", {
      //   method: "POST", 
      //   headers,
      //   body: JSON.stringify({ id, title })
      // });

      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, title } : task
        )
      );

      toast({
        title: "成功",
        description: "任务更新成功",
      });
    } catch (error) {
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

      // Simulate API call
      // await fetch("/update-status", {
      //   method: "POST",
      //   headers,
      //   body: JSON.stringify({ id, status: newStatus })
      // });

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "成功",
        description: `任务已${newStatus === "done" ? "完成" : "重新开启"}`,
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "更新状态失败",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Simulate API call
      // await fetch("/delete-task", {
      //   method: "POST",
      //   headers,
      //   body: JSON.stringify({ id })
      // });

      setTasks(prev => prev.filter(task => task.id !== id));

      toast({
        title: "成功",
        description: "任务删除成功",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "删除任务失败",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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