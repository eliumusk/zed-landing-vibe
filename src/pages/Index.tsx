import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundGrid from "@/components/BackgroundGrid";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Github, Bolt, Users, Brain, Video, Link as LinkIcon, Upload, Sparkles, FileDown, FileText, Image as ImageIcon, ShieldCheck, Languages } from "lucide-react";
//
const Index = () => {
  const logo = "/lovable-uploads/1a269a26-9009-4b73-80c2-654445d2810b.png";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "amazing_video2note",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, macOS, Linux, Windows",
    description: "AI 视频笔记工具：一键提取PPT、自动生成讲义与知识图片，极速体验，隐私安全。",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <nav className="container mx-auto flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="amazing_video2note logo" className="h-7 w-7" loading="lazy" />
            <span className="text-lg font-semibold tracking-tight text-primary">amazing_video2note</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">产品</a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground">资源</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">帮助</a>
            <Button size="sm" variant="outline" asChild>
              <a href="#upload" aria-label="上传视频">
                <Upload className="mr-1" /> 上传视频
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <BackgroundGrid />
          <div className="container mx-auto relative z-10 py-24 md:py-32 text-center">
            <p className="mb-6 flex items-center justify-center gap-3 text-xs md:text-sm text-primary">
              <Video className="h-4 w-4" aria-hidden /> 本地文件
              <span className="opacity-40">·</span>
              <LinkIcon className="h-4 w-4" aria-hidden /> 在线链接
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-primary animate-enter font-semibold">
              为老师和创作者打造的AI视频笔记工具
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
              一键提取PPT、自动生成讲义和知识图片，极致高效，极简体验。
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Button id="upload" variant="hero" size="lg" className="hover-scale">
                <Upload /> 上传视频
                <Badge variant="secondary" className="ml-1">New</Badge>
              </Button>
              <Button variant="outline" size="lg" className="hover-scale" asChild>
                <a href="#demo">
                  <Github className="mr-1" /> 试用Demo
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" />
                  <h3 className="font-medium">PPT智能提取</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">自动识别视频中的PPT页面，精准导出，节省备课时间。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-primary" />
                  <h3 className="font-medium">讲义自动生成</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">AI自动生成结构化讲义，支持一键编辑与美化。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-primary" />
                  <h3 className="font-medium">知识图片/卡片</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">自动生成知识点图片，便于课堂展示和学生复习。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <Bolt className="text-primary" />
                  <h3 className="font-medium">极速体验</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">无需注册，极速上传与处理，隐私安全。</p>
              </article>
            </div>
          </div>
        </section>

        <section id="demo" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Upload className="text-primary" />
                  <h3 className="font-medium">1. 上传/粘贴视频</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">拖拽或选择文件，或粘贴链接即可开始。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Brain className="text-primary" />
                  <h3 className="font-medium">2. AI自动处理</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">显示进度，自动识别PPT/生成讲义/提取知识点。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <FileDown className="text-primary" />
                  <h3 className="font-medium">3. 编辑与导出</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">拖拽调整、批量编辑、模板切换；一键导出PDF/Word/图片。</p>
              </article>
            </div>
          </div>
        </section>

        <section id="testimonials" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">“备课效率提升3倍，学生反馈超好！”</p>
                <p className="mt-2 text-xs text-muted-foreground">— XX老师</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">“一键生成讲义，省时省力。”</p>
                <p className="mt-2 text-xs text-muted-foreground">— 内容创作者</p>
              </article>
            </div>
          </div>
        </section>

        <section id="highlights" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-md border bg-card p-3 flex items-center gap-2"><ShieldCheck className="text-primary" /> 专为老师定制</div>
              <div className="rounded-md border bg-card p-3 flex items-center gap-2"><Sparkles className="text-primary" /> AI自动识别PPT，讲义一键生成</div>
              <div className="rounded-md border bg-card p-3 flex items-center gap-2"><Languages className="text-primary" /> 支持多语言</div>
              <div className="rounded-md border bg-card p-3 flex items-center gap-2"><ShieldCheck className="text-primary" /> 极速体验 · 隐私安全</div>
            </div>
          </div>
        </section>

        <section id="faq" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <h2 className="text-xl font-semibold">常见问题</h2>
            <div className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>支持哪些平台？</AccordionTrigger>
                  <AccordionContent>支持本地文件与在线链接（YouTube/B站/抖音等），此页面以通用图标呈现。</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>是否需要注册？</AccordionTrigger>
                  <AccordionContent>无需注册即可体验核心流程，专业功能可在登录后解锁。</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>我的数据是否安全？</AccordionTrigger>
                  <AccordionContent>采用最小化保留策略与可控存储，支持本地导出与删除。</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} amazing_video2note. 仅用于设计演示。</p>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Index;
