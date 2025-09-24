import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "./TaskManager";

interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "created_at" | "user_id">) => Promise<void>;
  loading: boolean;
}

export const TaskForm = ({ onSubmit, loading }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      status: "open"
    });

    // Clear form
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          任务标题 *
        </Label>
        <Input
          id="title"
          placeholder="请输入任务标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="transition-smooth focus:shadow-elegant"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          任务描述
        </Label>
        <Textarea
          id="description"
          placeholder="请输入任务描述（可选）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none transition-smooth focus:shadow-elegant"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-date" className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          到期时间
        </Label>
        <Input
          id="due-date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="transition-smooth focus:shadow-elegant"
        />
      </div>

      <Button 
        type="submit" 
        variant="success"
        size="lg"
        className="w-full"
        disabled={loading || !title.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            创建中...
          </>
        ) : (
          "新增任务"
        )}
      </Button>
    </form>
  );
};