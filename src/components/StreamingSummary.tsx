import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getStreamSummaryUrl } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props{taskId:string; isTaskCompleted?: boolean}

// 智能摘要组件（直接请求流式端点）
export function StreamingSummary({taskId, isTaskCompleted = false}:Props){
  const [isOpen,setIsOpen]=useState(true);
  const [txt,setTxt]=useState("");
  const [ing,setIng]=useState(false);
  const [started,setStarted]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [waiting,setWaiting]=useState(false); // ASR 未就绪
  const acRef=useRef<AbortController|null>(null);
  const tRef=useRef<number|undefined>(undefined);

  const start=useCallback(async()=>{
    if(ing||!taskId)return;
    setIng(true);setStarted(true);setWaiting(false);setErr(null);setTxt("");

    // 创建新的AbortController
    const controller = new AbortController();
    acRef.current = controller;

    try{
      const r=await fetch(getStreamSummaryUrl(taskId),{
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'text/plain'
        }
      });

      if(r.status===404){setWaiting(true);setIng(false);return;} // ASR 未就绪
      if(!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);

      const rd=r.body?.getReader();
      if(!rd) throw new Error("无法获取响应流");

      const dec=new TextDecoder();
      let buf="";

      try {
        while(true){
          const {done,value}=await rd.read();
          if(done) break;
          if(controller.signal.aborted) break;

          buf+=dec.decode(value,{stream:true});
          setTxt(buf);
        }
      } finally {
        rd.releaseLock();
      }
    }catch(e:any){
      if(e.name!=="AbortError" && !controller.signal.aborted) {
        setErr(e.message||"生成摘要时发生错误");
      }
    } finally{
      setIng(false);
      if(acRef.current === controller) {
        acRef.current = null;
      }
    }
  },[ing,taskId]);

  const stop=()=>{
    if(acRef.current) {
      acRef.current.abort();
      acRef.current = null;
    }
    setIng(false);
  }

  const regen=()=>{
    stop(); // 确保先停止当前请求
    setTxt("");setStarted(false);setErr(null);
    setTimeout(() => start(), 100); // 短暂延迟后重新开始
  }

  // 清理函数
  useEffect(()=>()=>{
    if(acRef.current) {
      acRef.current.abort();
      acRef.current = null;
    }
    if(tRef.current) {
      window.clearTimeout(tRef.current);
      tRef.current = undefined;
    }
  },[]);

  // 自动开始（仅在任务完成且未开始且未进行中时）
  useEffect(()=>{
    if(isTaskCompleted && !started && !ing && !waiting) {
      const timer = setTimeout(() => start(), 1000); // 任务完成后延迟启动
      return () => clearTimeout(timer);
    }
  },[isTaskCompleted, started, ing, waiting, start]);

  // 等待重试逻辑
  useEffect(()=>{
    if(waiting && !ing && !txt){
      tRef.current = window.setTimeout(() => start(), 2000); // 增加重试间隔
    }
    return () => {
      if(tRef.current) {
        window.clearTimeout(tRef.current);
        tRef.current = undefined;
      }
    }
  },[waiting,ing,txt,start]);

  return(
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <CardTitle className="text-lg">智能摘要</CardTitle>
                {ing&&(<Badge variant="default" className="animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin"/>生成中</Badge>)}
                {started&&!ing&&txt&&(<Badge variant="secondary">已完成</Badge>)}
                {waiting&&(<Badge variant="outline">等待转录完成</Badge>)}
              </div>
              <div className="flex items-center gap-2">
                {/* 控制按钮移到这里 */}
                {ing&&(<Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); stop();}}>停止生成</Button>)}
                {!ing&&txt&&(<Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); regen();}}><RefreshCw className="w-4 h-4 mr-2"/>重新生成</Button>)}
                {!ing&&!txt&&!waiting&&isTaskCompleted&&(<Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); start();}}>开始生成</Button>)}
                <Button variant="ghost" size="sm">{isOpen?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}</Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">


            <div className="min-h-[80px] max-h-[400px] overflow-y-auto">
              {err?(
                <div className="text-red-500 p-4 bg-red-50 rounded-md">
                  <p className="font-medium">生成失败</p>
                  <p className="text-sm mt-1">{err}</p>
                </div>
              ):(
                <div className="prose prose-sm max-w-none">
                  {txt ? (
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {txt}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm py-4">
                      {ing ? "正在生成智能摘要..." : "点击开始生成按钮开始生成摘要"}
                    </div>
                  )}
                  {ing&&(<span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"/>)}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
