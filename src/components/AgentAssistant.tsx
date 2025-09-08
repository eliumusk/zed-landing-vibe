import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Trash, BookOpen, Quote } from "lucide-react";
import { apiFetch } from "@/lib/http";
import { toast } from "sonner";
import { streamAgent } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AgentAssistantProps { taskId: string; }
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export function AgentAssistant({ taskId }: AgentAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "你好，我是笔记润色助手。我可以帮你润色、改写、总结你的 Markdown 内容，或把口语化的记录优化为正式表达。"
  }]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const handleSend = async () => {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setSending(true);

    try {
      await streamAgent(
        taskId,
        text,
        (delta) => {
          setMessages(p => {
            const arr = [...p];
            const last = arr[arr.length - 1];
            if (last?.role === "assistant") last.content += delta;
            return arr;
          });
        },
        () => {},
        (sources: string[]) => {
          // 处理检索到的文档片段
          setMessages(p => {
            const arr = [...p];
            const last = arr[arr.length - 1];
            if (last?.role === "assistant") last.sources = sources;
            return arr;
          });
        }
      );
    } catch (e) {
      console.error(e);
      toast.error("发送失败，请稍后重试");
      setMessages(p => [...p, { role: "assistant", content: "抱歉，服务暂时不可用。" }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearSession = async () => {
    try {
      await apiFetch(`/api/agent/sessions/${taskId}`, { method: "DELETE" });
      setMessages([{ role: "assistant", content: "已开始新的会话。我能如何帮助你润色笔记？" }]);
      toast.success("会话已清除");
    } catch (e) {
      console.error(e);
      toast.error("清除会话失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full shadow-lg" aria-label="打开润色助手">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>润色助手</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>犀牛鸟助手</DialogTitle>
              <DialogDescription>与我对话，获得改写、润色、总结建议</DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearSession} className="gap-1">
              <Trash className="w-4 h-4" /> 清除会话
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="h-[50vh] md:h-[60vh] rounded-lg border bg-background/50 overflow-y-auto p-4 space-y-4">
            {/* 加载状态显示在消息上方 */}
            {sending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在思考...
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-2">
                  {/* RAG 检索结果显示 */}
                  {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          基于笔记内容回答
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {m.sources.length} 个相关片段
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {m.sources.map((source, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Quote className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                              {source}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 消息内容 */}
                  <div className={`rounded-lg px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                              ) : (
                                <code className={className}>{children}</code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm mb-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {m.content || " "}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <div className="flex w-full items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入要润色的内容或向我提问，按 Enter 发送，Shift+Enter 换行"
              className="min-h-[44px]"
              rows={2}
            />
            <Button onClick={handleSend} disabled={!canSend} className="whitespace-nowrap">
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              发送
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
