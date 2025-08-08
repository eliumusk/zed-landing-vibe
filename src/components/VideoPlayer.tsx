import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  taskId: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ taskId, currentTime, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && currentTime !== undefined) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  // 直接使用静态路径提供视频文件
  const videoUrl = `http://localhost:8000/storage/tasks/${taskId}/original_video.mp4`;

  return (
    <Card className="overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full aspect-video object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          console.log("Video loaded, duration:", videoRef.current?.duration);
        }}
      />
    </Card>
  );
}