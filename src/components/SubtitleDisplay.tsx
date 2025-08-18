import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Subtitles, Clock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getResults } from "@/lib/api";

interface SubtitleItem {
  text: string;
  start_time: number;
  end_time: number;
}

interface SubtitleDisplayProps {
  taskId: string;
  currentTime: number;
}

export function SubtitleDisplay({ taskId, currentTime }: SubtitleDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 获取ASR结果
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

  // 处理ASR数据
  const subtitles = useMemo(() => {
    const asrResult = resultsQuery.data?.results?.asr_result;
    if (!asrResult) return [];
    
    // ASR结果可能是数组或包含result_sentences的对象
    const sentences = Array.isArray(asrResult) 
      ? asrResult 
      : asrResult.result_sentences || [];
    
    return sentences.map((item: any) => ({
      text: item.text || "",
      start_time: item.start_time || 0,
      end_time: item.end_time || 0,
    }));
  }, [resultsQuery.data]);

  // 找到当前时间对应的字幕
  const currentSubtitle = useMemo(() => {
    if (!subtitles.length || currentTime === undefined) return null;
    
    const currentTimeMs = currentTime * 1000; // 转换为毫秒
    return subtitles.find((subtitle: SubtitleItem) => 
      currentTimeMs >= subtitle.start_time && currentTimeMs <= subtitle.end_time
    );
  }, [subtitles, currentTime]);

  // 格式化时间显示
  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 如果没有字幕数据，不显示组件
  if (!subtitles.length) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Subtitles className="w-5 h-5" />
                <CardTitle className="text-lg">字幕转录</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {subtitles.length} 条
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* 当前字幕预览 */}
            {currentSubtitle && (
              <div className="mt-2 p-3 bg-primary/10 rounded-md border-l-4 border-primary">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(currentSubtitle.start_time)} - {formatTime(currentSubtitle.end_time)}
                </div>
                <p className="text-sm font-medium">{currentSubtitle.text}</p>
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {subtitles.map((subtitle: SubtitleItem, index: number) => {
                const isActive = currentSubtitle?.text === subtitle.text;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md border transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(subtitle.start_time)} - {formatTime(subtitle.end_time)}</span>
                      {isActive && (
                        <Badge variant="default" className="ml-auto text-xs">
                          当前播放
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? "font-medium" : ""}`}>
                      {subtitle.text}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {subtitles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Subtitles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无字幕数据</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
