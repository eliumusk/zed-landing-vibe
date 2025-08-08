import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getExportMarkdownUrl, getResults, getStatus } from "@/lib/api";

export default function Result() {
  const { taskId } = useParams<{ taskId: string }>();
  const nav = useNavigate();

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

  const s = statusQuery.data;
  const progress = Math.round(((s?.progress || 0) * 100));

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">视频处理结果</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <p>当前状态：<span className="font-medium">{s?.status || "加载中"}</span></p>
              <p className="text-muted-foreground">步骤：{s?.current_step || "-"}</p>
            </div>
            <Progress value={isNaN(progress) ? 0 : progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>操作</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2">
            <Button variant="outline" onClick={() => nav("/")}>返回首页</Button>
            <Button asChild disabled={!taskId}>
              <a href={taskId ? getExportMarkdownUrl(taskId) : "#"} target="_blank" rel="noopener">下载 Markdown</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>结果数据</CardTitle>
        </CardHeader>
        <CardContent>
          {statusQuery.data?.status !== "completed" ? (
            <p className="text-sm text-muted-foreground">处理完成后将展示 JSON 结果…</p>
          ) : (
            <pre className="text-xs overflow-auto max-h-[60vh] rounded-md border p-3 bg-card/60">
{JSON.stringify(resultsQuery.data, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
