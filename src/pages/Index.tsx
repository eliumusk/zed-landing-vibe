import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundGrid from "@/components/BackgroundGrid";
import { Download, Github, Bolt, Users, Brain } from "lucide-react";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zed 风格编辑器着陆页",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Linux, Windows",
    description: "极简、清新且高级的 Zed 风格着陆页复刻，网格底纹、优雅字体与蓝色品牌调性。",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <nav className="container mx-auto flex items-center justify-between py-4">
          <a href="/" className="font-display text-xl tracking-tight text-primary">Zed风格</a>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground story-link">特性</a>
            <a href="#download" className="text-sm text-muted-foreground hover:text-foreground story-link">下载</a>
            <Button size="sm" variant="outline" asChild>
              <a href="https://github.com" aria-label="GitHub">
                <Github />
                GitHub
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <BackgroundGrid />
          <div className="container mx-auto relative z-10 py-24 md:py-32 text-center">
            <p className="mb-6 flex items-center justify-center gap-2 text-xs md:text-sm text-primary">
              <span className="inline-block">🔎</span>
              <a href="#" className="story-link">全新调试器上线 →</a>
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-primary animate-enter">
              下一代的极简编辑体验
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
              受 Zed 启发的高性能编辑器着陆页设计：网格质感背景、优雅排版与专注蓝色调，带来清新、有格调的第一印象。
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Button id="download" variant="hero" size="lg" className="hover-scale">
                <Download /> 立即下载
                <Badge variant="secondary" className="ml-1">D</Badge>
              </Button>
              <Button variant="outline" size="lg" className="hover-scale" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github /> 查看源码
                </a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">适用于 macOS 与 Linux，Windows 即将推出</p>
          </div>
        </section>

        <section id="features" className="relative border-t">
          <div className="container mx-auto py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <Bolt className="text-primary" />
                  <h3 className="font-medium">疾速</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Rust 驱动的高性能体验，充分利用多核 CPU 与 GPU。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <Brain className="text-primary" />
                  <h3 className="font-medium">智能</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">整合 LLM，提升生成、重构与分析工作流。</p>
              </article>
              <article className="rounded-lg border bg-card p-6 shadow-sm hover-scale">
                <div className="flex items-center gap-3">
                  <Users className="text-primary" />
                  <h3 className="font-medium">协作</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">与团队实时协作、共享会话与笔记，一切就绪。</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zed 风格复刻。仅用于设计演示。</p>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Index;
