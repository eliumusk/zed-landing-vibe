import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Eye, Download } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onContentChange?: (content: string) => void;
  taskId: string;
  isEditable?: boolean;
}

export function MarkdownRenderer({
  content,
  onContentChange,
  taskId,
  isEditable = true
}: MarkdownRendererProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = () => {
    onContentChange?.(editedContent);
    setActiveTab("preview");
  };

  const handleDownload = () => {
    const base = (typeof window !== 'undefined' ? (window.localStorage.getItem('apiBaseUrl') || 'http://localhost:8000') : 'http://localhost:8000').replace(/\/$/, "");
    window.open(`${base}/api/export/${taskId}/markdown`, '_blank');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            图文笔记
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        {isEditable ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                预览
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                编辑
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 min-h-0 mt-0">
              <div className="h-full overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(src) => {
                    if (!src) return src;
                    // If src is absolute http(s), leave it
                    if (/^https?:\/\//i.test(src)) return src;
                    // If src starts with /storage/, prefix backend base URL
                    if (src.startsWith("/storage/")) {
                      const base = getApiBaseUrl().replace(/\/$/, "");
                      return `${base}${src}`;
                    }
                    return src;
                  }}
                >
                  {editedContent}
                </ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="flex-1 min-h-0 mt-0 flex flex-col gap-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="编辑您的笔记..."
                className="flex-1 min-h-0 resize-none font-mono text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedContent(content);
                    setActiveTab("preview");
                  }}
                >
                  取消
                </Button>
                <Button size="sm" onClick={handleSave}>
                  保存更改
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-full overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}