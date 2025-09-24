import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle2, 
  Circle, 
  Edit2, 
  Trash2, 
  Calendar,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "./TaskManager";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, title: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TaskItem = ({ task, onUpdate, onToggleStatus, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      await onUpdate(task.id, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === "open";

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-xl shadow-card border border-border/50 p-4 transition-smooth hover:shadow-elegant animate-scale-in",
        task.status === "done" && "bg-task-completed/50",
        isOverdue && "border-destructive/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleStatus(task.id)}
          className={cn(
            "flex-shrink-0 mt-1",
            task.status === "done" && "text-success hover:text-success/80"
          )}
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </Button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="icon" variant="success" onClick={handleSaveEdit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 
              className={cn(
                "font-medium text-lg mb-2 break-words",
                task.status === "done" && "line-through text-task-completed-foreground"
              )}
            >
              {task.title}
            </h3>
          )}

          {/* Description */}
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mb-3 break-words",
              task.status === "done" && "text-task-completed-foreground"
            )}>
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Due Date */}
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    逾期
                  </Badge>
                )}
              </div>
            )}

            {/* Status Badge */}
            <Badge 
              variant={task.status === "done" ? "secondary" : "default"}
              className="text-xs"
            >
              {task.status === "done" ? "已完成" : "进行中"}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-warning hover:text-warning hover:bg-warning/10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除任务 "{task.title}" 吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(task.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};