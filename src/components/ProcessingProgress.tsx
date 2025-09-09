import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Play, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingProgressProps {
  taskId: string;
  status: any;
  onComplete?: () => void;
}

const STEP_CONFIG = {
  extract_audio: { label: "提取音频", icon: "🎵", desc: "从视频中分离音频轨道" },
  asr: { label: "语音识别", icon: "🎤", desc: "将音频转换为文字" },
  merge_text: { label: "文本合并", icon: "📝", desc: "优化标点和句子结构" },
  summary: { label: "生成摘要", icon: "📋", desc: "分析内容并生成摘要" },
  multimodal: { label: "图文笔记", icon: "🖼️", desc: "提取关键帧并生成笔记" }
};

export function ProcessingProgress({ status, onComplete }: ProcessingProgressProps) {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notify-enabled");
    setNotifyEnabled(stored === "true");
  }, []);

  useEffect(() => {
    if (status?.status === "completed" && !hasCompleted) {
      setHasCompleted(true);
      handleCompletion();
      onComplete?.();
    }
  }, [status?.status, hasCompleted, onComplete]);

  const handleCompletion = () => {
    // 播放提示音 - 使用Web Audio API生成简单的提示音
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio notification failed:", error);
    }

    // 浏览器通知
    if (notifyEnabled && Notification.permission === "granted") {
      new Notification("视频处理完成 ✅", {
        body: "点击查看结果",
        icon: "/favicon.ico"
      });
    }
  };

  const enableNotifications = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifyEnabled(true);
        localStorage.setItem("notify-enabled", "true");
      }
    } else if (Notification.permission === "granted") {
      setNotifyEnabled(true);
      localStorage.setItem("notify-enabled", "true");
    }
  };

  const disableNotifications = () => {
    setNotifyEnabled(false);
    localStorage.setItem("notify-enabled", "false");
  };

  if (!status || status.status === "completed") return null;

  const progress = status.progress_percent || 0;
  const currentStep = status.current_step || "pending";
  const isProcessing = status.status === "processing";
  const isFailed = status.status === "failed";

  const getStepStatus = (stepKey: string) => {
    const steps = Object.keys(STEP_CONFIG);
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex && isProcessing) return "active";
    return "pending";
  };

  const formatETA = () => {
    if (!isProcessing || progress <= 0) return null;
    const remaining = (1 - progress) * 120; // 估算2分钟总时长
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className="p-8">
        {/* 隐藏的音频引用 - 现在使用Web Audio API */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* 头部状态 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              isFailed ? "bg-red-500" : "bg-blue-500"
            )} />
            <h3 className="text-lg font-semibold text-gray-900">
              {isFailed ? "处理失败" : "正在处理视频"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {formatETA() && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                剩余 {formatETA()}
              </Badge>
            )}

            {!notifyEnabled ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={enableNotifications}
                className="text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                开启通知
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={disableNotifications}
                className="text-xs text-green-600"
              >
                <BellOff className="w-3 h-3 mr-1" />
                已开启
              </Button>
            )}
          </div>
        </div>

        {/* 总体进度条 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">总体进度</span>
            <span className="text-sm text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                isFailed
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-4">
          {Object.entries(STEP_CONFIG).map(([stepKey, config]) => {
            const stepStatus = getStepStatus(stepKey);
            const isActive = stepStatus === "active";
            const isCompleted = stepStatus === "completed";

            return (
              <div
                key={stepKey}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                  isActive && "bg-blue-50 border border-blue-200",
                  isCompleted && "bg-green-50 border border-green-200",
                  !isActive && !isCompleted && "bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                  isCompleted && "bg-green-500 text-white",
                  isActive && "bg-blue-500 text-white animate-pulse",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <span>{config.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-medium transition-colors duration-300",
                      isActive && "text-blue-700",
                      isCompleted && "text-green-700",
                      !isActive && !isCompleted && "text-gray-600"
                    )}>
                      {config.label}
                    </h4>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        进行中
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm transition-colors duration-300",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-500"
                  )}>
                    {config.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 错误信息 */}
        {isFailed && status.error_message && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">处理失败</span>
            </div>
            <p className="text-sm text-red-600">{status.error_message}</p>
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            处理完成后将自动刷新页面显示结果
          </p>
        </div>
      </CardContent>
    </Card>
  );
}