import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getResults, getStreamSummaryUrl } from "@/lib/api";

interface StreamingSummaryProps {
  taskId: string;
}

export function StreamingSummary({ taskId }: StreamingSummaryProps) {
  const [isOpen, setIsOpen] = useState(true); // 默认展开
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false); // 标记是否已自动触发
  const abortControllerRef = useRef<AbortController | null>(null);

  // 检查ASR是否完成
  const resultsQuery = useQuery({
    queryKey: ["results", taskId],
    queryFn: () => getResults(taskId),
    enabled: !!taskId,
    retry: 1,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      // 如果还没有ASR结果，继续轮询
      return data?.results?.asr_result ? false : 3000;
    },
  });

  const hasAsrResult = !!resultsQuery.data?.results?.asr_result;

  // 开始流式摘要
  const startStreaming = useCallback(async () => {
    if (isStreaming || !hasAsrResult) return;

    setIsStreaming(true);
    setHasStarted(true);
    setStreamingText("");
    setError(null);

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(getStreamSummaryUrl(taskId), {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法获取响应流");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        setStreamingText(buffer);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || "生成摘要时发生错误");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [hasAsrResult, taskId]);

  // 自动触发摘要生成
  useEffect(() => {
    if (hasAsrResult && !autoTriggered && !hasStarted && !isStreaming) {
      setAutoTriggered(true);
      startStreaming();
    }
  }, [hasAsrResult, autoTriggered, hasStarted, isStreaming, startStreaming]);

  // 停止流式传输
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // 重新生成
  const regenerate = () => {
    setStreamingText("");
    setHasStarted(false);
    setError(null);
    startStreaming();
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);



  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <CardTitle className="text-lg">智能摘要</CardTitle>
                {isStreaming && (
                  <Badge variant="default" className="animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    生成中
                  </Badge>
                )}
                {hasStarted && !isStreaming && (
                  <Badge variant="secondary">
                    已完成
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {!hasStarted && !isStreaming && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>等待ASR转录完成后自动生成摘要...</p>
              </div>
            )}

            {!hasStarted && isStreaming && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-muted-foreground">正在生成智能摘要，请稍候...</p>
              </div>
            )}

            {hasStarted && (
              <div className="space-y-4">
                {/* 控制按钮 */}
                <div className="flex items-center gap-2">
                  {isStreaming && (
                    <Button variant="outline" size="sm" onClick={stopStreaming}>
                      停止生成
                    </Button>
                  )}
                  {!isStreaming && streamingText && (
                    <Button variant="outline" size="sm" onClick={regenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新生成
                    </Button>
                  )}
                </div>

                {/* 摘要内容 */}
                <div className="min-h-[100px] max-h-[400px] overflow-y-auto">
                  {error ? (
                    <div className="text-red-500 p-4 bg-red-50 rounded-md">
                      <p className="font-medium">生成失败</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {streamingText}
                        {isStreaming && (
                          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 状态信息 */}
                {isStreaming && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在生成摘要，请稍候...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
