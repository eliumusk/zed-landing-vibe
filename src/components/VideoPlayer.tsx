import { useRef, useEffect, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/config";
import { Minimize2, Maximize2, EyeOff, Eye } from "lucide-react";

interface VideoPlayerProps {
  taskId: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ taskId, currentTime, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  useEffect(() => {
    if (videoRef.current && currentTime !== undefined) {
      const video = videoRef.current;
      const timeDiff = Math.abs(video.currentTime - currentTime);

      // Only seek if the difference is significant (more than 0.5 seconds)
      // and we're not already seeking
      if (timeDiff > 0.5 && !isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = currentTime;

        // Reset seeking flag after a short delay
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 100);
      }
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && onTimeUpdate && !isSeekingRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      const now = Date.now();

      // Throttle updates to every 200ms to prevent excessive re-renders
      if (now - lastUpdateTimeRef.current > 200) {
        lastUpdateTimeRef.current = now;
        onTimeUpdate(currentVideoTime);
      }
    }
  }, [onTimeUpdate]);

  // 使用动态API基础URL提供视频文件
  const videoUrl = `${getApiBaseUrl().replace(/\/$/, "")}/storage/tasks/${taskId}/original_video.mp4`;

  // 视图控制
  const [hidden,setHidden]=useState(false);
  const [compact,setCompact]=useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="text-xs text-muted-foreground">视频预览</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={()=>setCompact(v=>!v)} className="h-7 px-2">
            {compact? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
          </Button>
          <Button variant="ghost" size="sm" onClick={()=>setHidden(v=>!v)} className="h-7 px-2">
            {hidden? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
          </Button>
        </div>
      </div>
      {!hidden && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className={compact? "w-full aspect-[16/10] object-cover" : "w-full aspect-video object-cover"}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {console.log("Video loaded, duration:", videoRef.current?.duration);}}
          onSeeking={()=>{isSeekingRef.current=true;}}
          onSeeked={()=>{setTimeout(()=>{isSeekingRef.current=false;},50);}}
        />
      )}
    </Card>
  );
}