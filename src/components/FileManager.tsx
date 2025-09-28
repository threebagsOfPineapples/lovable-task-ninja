import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Loader2,
  AlertCircle,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Archive
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Document } from "./Dashboard";

// 支持的文件类型配置
const SUPPORTED_FILE_TYPES = {
  // 文档类型
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'Word', color: 'text-blue-500' },
  'application/msword': { icon: FileText, label: 'Word', color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileImage, label: 'PowerPoint', color: 'text-orange-500' },
  'application/vnd.ms-powerpoint': { icon: FileImage, label: 'PowerPoint', color: 'text-orange-500' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'Excel', color: 'text-green-500' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'Excel', color: 'text-green-500' },
  
  // 文本类型
  'text/plain': { icon: FileCode, label: 'Text', color: 'text-gray-500' },
  'text/markdown': { icon: FileCode, label: 'Markdown', color: 'text-purple-500' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'text-green-600' },
  
  // 其他格式
  'application/rtf': { icon: FileText, label: 'RTF', color: 'text-indigo-500' },
  'application/epub+zip': { icon: FileText, label: 'EPUB', color: 'text-teal-500' },
};

const ACCEPTED_FILE_TYPES = Object.keys(SUPPORTED_FILE_TYPES).join(',');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface FileManagerProps {
  isTestMode: boolean;
}

export const FileManager = ({ isTestMode }: FileManagerProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      // Use type assertion to work around Supabase typing issue
      const { data, error } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message || "无法加载文件列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
      const supportedFormats = Object.values(SUPPORTED_FILE_TYPES).map(type => type.label).join(', ');
      toast({
        title: "文件类型不支持",
        description: `支持的格式：${supportedFormats}`,
        variant: "destructive",
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "文件过大",
        description: `文件大小不能超过${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record to database
      const { error: dbError } = await (supabase as any)
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) throw dbError;

      // Call webhook for processing (optional)
      try {
        const baseUrl = isTestMode ? 'https://threepoy.app.n8n.cloud/webhook-test' : 'https://threepoy.app.n8n.cloud/webhook';
        const response = await fetch(`${baseUrl}/upload-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_name: file.name,
            file_path: filePath,
            user_id: user.id
          })
        });
        
        if (!response.ok) {
          console.warn('Webhook call failed:', response.statusText);
        }
      } catch (webhookError) {
        console.warn('Webhook error:', webhookError);
        // Continue even if webhook fails
      }

      toast({
        title: "上传成功",
        description: `文件 "${file.name}" 已成功上传`,
      });

      // Reload documents
      loadDocuments();
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message || "文件上传失败",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "删除成功",
        description: `文件 "${doc.file_name}" 已删除`,
      });

      // Reload documents
      loadDocuments();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除文件",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const typeConfig = SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES];
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className={`h-5 w-5 ${typeConfig.color} flex-shrink-0 mt-0.5`} />;
    }
    return <File className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    const typeConfig = SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES];
    return typeConfig?.label || '未知格式';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Upload Button */}
      <div className="mb-6">
        <Button
          onClick={handleFileSelect}
          disabled={uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              上传文档
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          支持: PDF, Word, Excel, PowerPoint, 文本文件等
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">还没有上传任何文档</p>
            <p className="text-sm text-muted-foreground mt-1">
              支持PDF、Word、Excel、PowerPoint等多种格式
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-secondary/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.file_type)}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {doc.file_name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getFileTypeLabel(doc.file_type)} • {formatFileSize(doc.file_size)} • {' '}
                          {new Date(doc.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};