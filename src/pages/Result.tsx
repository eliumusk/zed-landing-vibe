import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TimelineView } from "@/components/TimelineView";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getExportMarkdownUrl, getResults, getStatus, getMarkdownContent } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function Result() {
  const { taskId } = useParams<{ taskId: string }>();
  const nav = useNavigate();
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  useEffect(() => {
    document.title = taskId ? `视频处理结果 · ${taskId}` : "视频处理结果";
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", window.location.href);
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [taskId]);

  const statusQuery = useQuery({
    queryKey: ["status", taskId],
    queryFn: () => getStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: (q) => {
      const s = q.state.data as any;
      return s && (s.status === "completed" || s.status === "failed") ? false : 2000;
    },
  });

  const resultsQuery = useQuery({
    queryKey: ["results", taskId],
    queryFn: () => getResults(taskId!),
    enabled: !!taskId && statusQuery.data?.status === "completed",
  });

  const markdownQuery = useQuery({
    queryKey: ["markdown", taskId],
    queryFn: () => getMarkdownContent(taskId!),
    enabled: !!taskId && statusQuery.data?.status === "completed",
  });

  const s = statusQuery.data;
  const progress = Math.round(((s?.progress || 0) * 100));

  // 处理时间轴数据
  const timelineSegments = useMemo(() => {
    const results = resultsQuery.data;
    if (!results?.multimodal_notes) return [];

    return results.multimodal_notes.map((note: any, index: number) => ({
      timestamp: note.timestamp || index * 30, // 假设每段30秒
      endTimestamp: note.end_timestamp,
      text: note.text || note.content || "",
      summary: note.summary || note.title,
      frameUrl: note.frame_file || note.image_file
    }));
  }, [resultsQuery.data]);

  const handleSegmentClick = (timestamp: number) => {
    setCurrentVideoTime(timestamp);
  };

  const handleMarkdownChange = (content: string) => {
    // 这里可以添加保存到后端的逻辑
    console.log("Markdown updated:", content);
  };

  return (
    <main className="container mx-auto py-6 px-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => nav("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">视频处理结果</h1>
            <p className="text-sm text-muted-foreground">任务ID: {taskId}</p>
          </div>
        </div>
      </div>

      {/* 处理状态 */}
      {s?.status !== "completed" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <p>当前状态：<span className="font-medium">{s?.status || "加载中"}</span></p>
              <p className="text-muted-foreground">步骤：{s?.current_step || "-"}</p>
            </div>
            <Progress value={isNaN(progress) ? 0 : progress} />
          </CardContent>
        </Card>
      )}

      {/* 主内容区域 */}
      {statusQuery.data?.status === "completed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* 左侧：视频播放器 + 时间轴 */}
          <div className="space-y-6">
            {taskId && (
              <VideoPlayer
                taskId={taskId}
                currentTime={currentVideoTime}
                onTimeUpdate={setCurrentVideoTime}
              />
            )}
            
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>时间轴导航</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineView
                  segments={timelineSegments}
                  currentTime={currentVideoTime}
                  onSegmentClick={handleSegmentClick}
                  taskId={taskId!}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：Markdown渲染 */}
          <div className="h-full">
            <MarkdownRenderer
              content={markdownQuery.data || "正在加载笔记内容..."}
              onContentChange={handleMarkdownChange}
              taskId={taskId!}
              isEditable={true}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在处理视频，请稍候...</p>
          </div>
        </div>
      )}
    </main>
  );
}
