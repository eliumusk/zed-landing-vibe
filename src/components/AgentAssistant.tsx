import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Loader2, Trash } from "lucide-react";
import { apiFetch } from "@/lib/http";
import { toast } from "sonner";

interface AgentAssistantProps {
  taskId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AgentAssistant({ taskId }: AgentAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "你好，我是笔记润色助手。我可以帮你润色、改写、总结你的 Markdown 内容，或把口语化的记录优化为正式表达。",
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
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);
    try {
      const form = new FormData();
      form.append("message", text);
      form.append("task_id", taskId);
      const res = await apiFetch<{ content: string; task_id: string; status: string }>("/api/agent/runs", {
        method: "POST",
        body: form,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: (res as any)?.content || "" }]);
    } catch (e) {
      console.error(e);
      toast.error("发送失败，请稍后重试");
      setMessages((prev) => [...prev, { role: "assistant", content: "抱歉，服务暂时不可用。" }]);
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

      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>笔记润色助手</DialogTitle>
              <DialogDescription>与智能助手对话，获得改写、润色、总结建议（不修改你的文件）。</DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearSession} className="gap-1">
              <Trash className="w-4 h-4" /> 清除会话
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="h-[50vh] md:h-[60vh] rounded-lg border bg-background/50 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    `max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ` +
                    (m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> 正在思考…
                </div>
              </div>
            )}
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
