import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ListTodo,
  CheckCircle2,
  Filter,
  Loader2
} from "lucide-react";
import { useState } from "react";
import type { Task } from "./TaskManager";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onUpdate: (id: string, title: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TaskList = ({ 
  tasks, 
  loading, 
  onUpdate, 
  onToggleStatus, 
  onDelete 
}: TaskListProps) => {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const openTasks = tasks.filter(t => t.status === "open").length;
  const completedTasks = tasks.filter(t => t.status === "done").length;

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          加载任务中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats and Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <Badge variant="secondary" className="font-medium">
              {openTasks} 进行中
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <Badge variant="secondary" className="font-medium">
              {completedTasks} 已完成
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部任务</SelectItem>
              <SelectItem value="open">进行中</SelectItem>
              <SelectItem value="done">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <ListTodo className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {filter === "all" 
              ? "暂无任务" 
              : filter === "open" 
                ? "暂无进行中的任务"
                : "暂无已完成的任务"
            }
          </h3>
          <p className="text-muted-foreground">
            {filter === "all" && "创建您的第一个任务开始管理工作吧！"}
            {filter === "open" && "所有任务都已完成，干得漂亮！"}
            {filter === "done" && "还没有完成任何任务，继续加油！"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};