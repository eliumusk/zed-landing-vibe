import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "zh" | "en";

type Dict = Record<string, string>;

type I18nContextType = {
  lang: Lang;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "app_lang";

const zh: Dict = {
  "brand.name": "FrameNote",
  "nav.product": "产品",
  "nav.resources": "资源",
  "nav.faq": "帮助",
  "hero.title": "FrameNote：课堂、故事、尽收眼底。",
  "hero.subtitle": "一键提取PPT、自动生成讲义和知识图片，极致高效，极简体验。",
  "hero.upload": "上传视频",
  "hero.demo": "试用Demo",
  "features.title.1": "PPT智能提取",
  "features.desc.1": "自动识别视频中的PPT页面，精准导出，节省备课时间。",
  "features.title.2": "讲义自动生成",
  "features.desc.2": "AI自动生成结构化讲义，支持一键编辑与美化。",
  "features.title.3": "知识图片/卡片",
  "features.desc.3": "自动生成知识点图片，便于课堂展示和学生复习。",
  "features.title.4": "极速体验",
  "features.desc.4": "无需注册，极速上传与处理，隐私安全。",
  "steps.1": "1. 上传/粘贴视频",
  "steps.1.desc": "拖拽或选择文件，或粘贴链接即可开始。",
  "steps.2": "2. AI自动处理",
  "steps.2.desc": "显示进度，自动识别PPT/生成讲义/提取知识点。",
  "steps.3": "3. 编辑与导出",
  "steps.3.desc": "拖拽调整、批量编辑、模板切换；一键导出PDF/Word/图片。",
  "high.1": "专为高效的你定制",
  "high.2": "AI自动识别PPT，讲义一键生成",
  "high.3": "支持多语言",
  "high.4": "极速体验 · 隐私安全",
  "faq.title": "常见问题",
  "faq.q1": "支持哪些平台？",
  "faq.a1": "支持本地文件与在线链接（YouTube/B站等），此页面以通用图标呈现。",
  "faq.q2": "是否需要注册？",
  "faq.a2": "无需注册即可体验核心流程，专业功能可在登录后解锁。",
  "faq.q3": "我的数据是否安全？",
  "faq.a3": "采用最小化保留策略与可控存储，支持本地导出与删除。",
  "footer.copyright": "仅用于设计演示。",

  "result.back": "返回",
  "result.title": "视频处理结果",
  "result.task": "任务ID",
  "result.status": "当前状态",
  "result.step": "步骤",
  "result.timeline": "时间轴导航",
  "result.loading": "正在处理视频，请稍候...",
  "result.notes.loading": "正在加载笔记内容...",
  "toast.save.ok": "笔记保存成功",
  "toast.save.fail": "保存失败，请重试",

  "notfound.title": "页面不存在",
  "notfound.back": "返回首页",

  "seo.index.title": "FrameNote | AI视频笔记工具",
  "seo.index.desc": "AI 视频笔记工具：一键提取PPT、自动生成讲义和知识图片，极致高效，极简体验。",
  "seo.result.desc": "查看并编辑由AI生成的视频讲义与时间轴笔记。",

  "url.input.label": "视频链接",
  "url.input.placeholder": "粘贴视频链接（支持 YouTube/B站 等）",
  "url.preview": "预览",
  "url.start": "解析并下载",
  "url.progress": "进度",
  "url.progress.download": "下载",
  "url.progress.processing": "处理",
  "url.viewResult": "查看结果",
  "url.invalid": "请输入有效的链接",
  "url.preview.fail": "预览失败，请稍后重试",
  "url.start.ok": "下载任务已启动",
  "url.start.fail": "启动失败，请重试",

  "upload.local": "本地文件",
  "upload.online": "在线链接",

  "notes.image.tools": "图片管理与裁剪",
  "notes.image.none": "未检测到图片",
  "notes.image.untitled": "未命名图片",
  "notes.image.crop": "裁剪并嵌入Base64",
  "notes.crop.title": "裁剪图片",
  "notes.crop.zoom": "缩放",
  "notes.crop.cancel": "取消",
  "notes.crop.apply": "应用裁剪",
  "notes.crop.error": "裁剪失败，请重试",
  "notes.image.load.error": "图片加载失败，请检查链接或跨域设置",

  // Video Player
  "video.preview": "视频预览",

  // Subtitle Display
  "subtitle.title": "字幕转录",
  "subtitle.count": "条",
  "subtitle.current": "当前播放",
  "subtitle.empty": "暂无字幕数据",

  // Streaming Summary
  "summary.title": "智能摘要",
  "summary.generating": "生成中",
  "summary.completed": "已完成",
  "summary.waiting": "等待转录完成",
  "summary.stop": "停止生成",
  "summary.regenerate": "重新生成",
  "summary.start": "开始生成",
  "summary.generating.text": "正在生成智能摘要...",
  "summary.start.text": "点击开始生成按钮开始生成摘要",
  "summary.failed": "生成失败",
  "summary.stream.error": "无法获取响应流",

  // Processing Progress
  "progress.extract_audio": "提取音频",
  "progress.asr": "语音识别",
  "progress.merge_text": "文本合并",
  "progress.summary": "生成摘要",
  "progress.multimodal": "图文笔记",
  "progress.extract_audio.desc": "从视频中分离音频轨道",
  "progress.asr.desc": "将音频转换为文字",
  "progress.merge_text.desc": "优化标点和句子结构",
  "progress.summary.desc": "分析内容并生成摘要",
  "progress.multimodal.desc": "提取关键帧并生成笔记",
  "progress.overall": "总体进度",
  "progress.completed.notification": "视频处理完成 ✅",
  "progress.completed.body": "点击查看结果",
  "progress.completed.tip": "处理完成后将自动刷新页面显示结果",
  "progress.processing": "正在处理视频",
  "progress.failed": "处理失败",
  "progress.active": "进行中",

  // Markdown Renderer
  "markdown.title": "图文笔记",
  "markdown.preview": "预览",
  "markdown.edit": "编辑",
  "markdown.export.md": "导出 MD",
  "markdown.export.pdf": "导出 PDF",
  "markdown.cancel": "取消",
  "markdown.save": "保存更改",

  // Agent Assistant
  "agent.title": "犀牛鸟助手",
  "agent.tooltip": "润色助手",
  "agent.description": "与我对话，获得改写、润色、总结建议",
  "agent.welcome": "你好，我是笔记润色助手。我可以帮你润色、改写、总结你的 Markdown 内容，或把口语化的记录优化为正式表达。",
  "agent.send": "发送",
  "agent.placeholder": "输入要润色的内容或向我提问，按 Enter 发送，Shift+Enter 换行",
  "agent.send.error": "发送失败，请稍后重试",
  "agent.service.error": "抱歉，服务暂时不可用。",

  // Online Downloader
  "download.status": "状态",
  "download.downloading": "下载中...",
  "download.processing": "处理中...",
  "download.completed": "完成",
  "download.failed": "失败",
  "download.view.result": "查看结果",

  // Upload Dialog
  "upload.dialog.title": "上传并开始处理",
  "upload.dialog.description": "选择本地视频文件后提交即可开始处理。",
  "upload.file.label": "视频文件",
  "upload.file.required": "请选择视频文件",
  "upload.file.supported": "支持 mp4, avi, mov, mkv, webm",
  "upload.success": "上传成功",
  "upload.failed": "操作失败",
  "upload.retry": "请稍后重试",
  "upload.multimodal.label": "生成图文笔记",
  "upload.multimodal.desc": "开启后将提取关键帧并生成图文笔记。",
  "upload.keeptemp.label": "保留临时文件",
  "upload.keeptemp.desc": "调试时可开启，默认关闭以节省空间。",
  "upload.cancel": "取消",
  "upload.start": "开始",
  "upload.processing": "处理中…"
};

const en: Dict = {
  "brand.name": "FrameNote",
  "nav.product": "Product",
  "nav.resources": "Resources",
  "nav.faq": "Help",
  "hero.title": "FrameNote: Your lecture. Your story. Captured.",
  "hero.subtitle": "Extract slides, auto-generate handouts and knowledge images. Super efficient, minimal UI.",
  "hero.upload": "Upload Video",
  "hero.demo": "Try Demo",
  "features.title.1": "Smart PPT Extraction",
  "features.desc.1": "Detect slides in videos precisely to save prep time.",
  "features.title.2": "Auto Handouts",
  "features.desc.2": "AI generates structured handouts, easy to edit and beautify.",
  "features.title.3": "Knowledge Images/Cards",
  "features.desc.3": "Create knowledge images for class display and review.",
  "features.title.4": "Lightning Fast",
  "features.desc.4": "No signup required. Fast upload & processing with privacy.",
  "steps.1": "1. Upload/Paste Video",
  "steps.1.desc": "Drag & drop, choose a file, or paste a link.",
  "steps.2": "2. AI Processing",
  "steps.2.desc": "Progress shown. Slide detection, handout generation, knowledge extraction.",
  "steps.3": "3. Edit & Export",
  "steps.3.desc": "Reorder, batch edit, switch templates. Export to PDF/Word/Images.",
  "high.1": "Tailored for You",
  "high.2": "Auto slide detection & one-click handouts",
  "high.3": "Multi-language Support",
  "high.4": "Fast • Private",
  "faq.title": "FAQ",
  "faq.q1": "Which platforms are supported?",
  "faq.a1": "Local files and online links (YouTube/Bilibili, etc.).",
  "faq.q2": "Is registration required?",
  "faq.a2": "Try core features without signup; pro features after login.",
  "faq.q3": "Is my data safe?",
  "faq.a3": "Minimal retention and controllable storage. Support local export and deletion.",
  "footer.copyright": "For design demo only.",

  "result.back": "Back",
  "result.title": "Video Processing Result",
  "result.task": "Task ID",
  "result.status": "Status",
  "result.step": "Step",
  "result.timeline": "Timeline",
  "result.loading": "Processing video, please wait...",
  "result.notes.loading": "Loading notes...",
  "toast.save.ok": "Notes saved",
  "toast.save.fail": "Save failed, please retry",

  "notfound.title": "Page Not Found",
  "notfound.back": "Return Home",

  "seo.index.title": "FrameNote | AI Video Notes Tool",
  "seo.index.desc": "Extract slides, auto-generate handouts and knowledge images. Super efficient, minimal UI.",
  "seo.result.desc": "View and edit AI-generated handouts and timeline notes.",

  "url.input.label": "Video URL",
  "url.input.placeholder": "Paste a video URL (YouTube/Bilibili, etc.)",
  "url.preview": "Preview",
  "url.start": "Parse & Download",
  "url.progress": "Progress",
  "url.progress.download": "Download",
  "url.progress.processing": "Processing",
  "url.viewResult": "View Result",
  "url.invalid": "Please enter a valid URL",
  "url.preview.fail": "Preview failed, try again later",
  "url.start.ok": "Download started",
  "url.start.fail": "Start failed, please retry",

  "upload.local": "Local File",
  "upload.online": "Online Link",

  "notes.image.tools": "Image Manager & Crop",
  "notes.image.none": "No images detected",
  "notes.image.untitled": "Untitled image",
  "notes.image.crop": "Crop and embed Base64",
  "notes.crop.title": "Crop Image",
  "notes.crop.zoom": "Zoom",
  "notes.crop.cancel": "Cancel",
  "notes.crop.apply": "Apply Crop",
  "notes.crop.error": "Cropping failed, please retry",
  "notes.image.load.error": "Failed to load image. Check URL/CORS",

  // Video Player
  "video.preview": "Video Preview",

  // Subtitle Display
  "subtitle.title": "Subtitle Transcription",
  "subtitle.count": "items",
  "subtitle.current": "Currently Playing",
  "subtitle.empty": "No subtitle data available",

  // Streaming Summary
  "summary.title": "Smart Summary",
  "summary.generating": "Generating",
  "summary.completed": "Completed",
  "summary.waiting": "Waiting for transcription",
  "summary.stop": "Stop Generation",
  "summary.regenerate": "Regenerate",
  "summary.start": "Start Generation",
  "summary.generating.text": "Generating smart summary...",
  "summary.start.text": "Click the start button to generate summary",
  "summary.failed": "Generation Failed",
  "summary.stream.error": "Unable to get response stream",

  // Processing Progress
  "progress.extract_audio": "Extract Audio",
  "progress.asr": "Speech Recognition",
  "progress.merge_text": "Merge Text",
  "progress.summary": "Generate Summary",
  "progress.multimodal": "Multimodal Notes",
  "progress.extract_audio.desc": "Separating audio track from video",
  "progress.asr.desc": "Converting audio to text",
  "progress.merge_text.desc": "Optimizing punctuation and sentence structure",
  "progress.summary.desc": "Analyzing content and generating summary",
  "progress.multimodal.desc": "Extracting key frames and generating notes",
  "progress.overall": "Overall Progress",
  "progress.completed.notification": "Video Processing Completed ✅",
  "progress.completed.body": "Click to view results",
  "progress.completed.tip": "Page will auto-refresh to show results when processing is complete",
  "progress.processing": "Processing Video",
  "progress.failed": "Processing Failed",
  "progress.active": "In Progress",

  // Markdown Renderer
  "markdown.title": "Multimodal Notes",
  "markdown.preview": "Preview",
  "markdown.edit": "Edit",
  "markdown.export.md": "Export MD",
  "markdown.export.pdf": "Export PDF",
  "markdown.cancel": "Cancel",
  "markdown.save": "Save Changes",

  // Agent Assistant
  "agent.title": "Rhino Assistant",
  "agent.tooltip": "Polish Assistant",
  "agent.description": "Chat with me to get rewriting, polishing, and summarizing suggestions",
  "agent.welcome": "Hello, I'm your note polishing assistant. I can help you polish, rewrite, summarize your Markdown content, or optimize colloquial records into formal expressions.",
  "agent.send": "Send",
  "agent.placeholder": "Enter content to polish or ask me questions. Press Enter to send, Shift+Enter for new line",
  "agent.send.error": "Send failed, please try again later",
  "agent.service.error": "Sorry, service is temporarily unavailable.",

  // Online Downloader
  "download.status": "Status",
  "download.downloading": "Downloading...",
  "download.processing": "Processing...",
  "download.completed": "Completed",
  "download.failed": "Failed",
  "download.view.result": "View Result",

  // Upload Dialog
  "upload.dialog.title": "Upload and Start Processing",
  "upload.dialog.description": "Select a local video file and submit to start processing.",
  "upload.file.label": "Video File",
  "upload.file.required": "Please select a video file",
  "upload.file.supported": "Supports mp4, avi, mov, mkv, webm",
  "upload.success": "Upload successful",
  "upload.failed": "Operation failed",
  "upload.retry": "Please try again later",
  "upload.multimodal.label": "Generate Multimodal Notes",
  "upload.multimodal.desc": "Extract key frames and generate multimodal notes when enabled.",
  "upload.keeptemp.label": "Keep Temporary Files",
  "upload.keeptemp.desc": "Enable for debugging, disabled by default to save space.",
  "upload.cancel": "Cancel",
  "upload.start": "Start",
  "upload.processing": "Processing..."
};

const dicts: Record<Lang, Dict> = { zh, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Lang | null;
    return saved || (navigator.language.startsWith("zh") ? "zh" : "en");
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useMemo(() => (key: string) => {
    const d = dicts[lang];
    return d[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
};
