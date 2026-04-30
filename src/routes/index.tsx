import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, MapPin, Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);

  const nav = [
    { label: "Início", href: "#inicio" },
    { label: "O Dashboard", href: "#dashboard" },
    { label: "Como a IA ajuda", href: "#ia" },
    { label: "Sobre o Projeto", href: "#sobre" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-soft">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="tracking-tight">Monitor de Emendas</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {n.label}
              </a>
            ))}
          </nav>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="px-6 py-4 flex flex-col gap-4">
              {nav.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Transparência pública potencializada por IA
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Monitor de Emendas
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Brasil
              </span>
            </h1>
            <h2 className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transparência inteligente: decodificando o destino das emendas parlamentares com IA Generativa.
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-elegant hover:opacity-95 transition-all hover:-translate-y-0.5"
              >
                Acessar Dashboard Completo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#ia"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card font-semibold hover:bg-secondary transition-colors"
              >
                Como funciona
              </a>
            </div>
          </div>

          {/* Abstract chart illustration */}
          <div className="relative hidden md:block">
            <div className="relative aspect-square max-w-md ml-auto rounded-3xl bg-gradient-to-br from-primary to-primary-glow p-1 shadow-elegant">
              <div className="h-full w-full rounded-[22px] bg-card p-8 flex flex-col justify-end">
                <div className="flex items-end gap-3 h-3/4">
                  {[40, 70, 55, 85, 60, 95, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-primary-glow opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Análise em tempo real</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Ao vivo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section id="dashboard" className="py-16 md:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O Dashboard Interativo</h2>
            <p className="mt-3 text-muted-foreground">
              Explore visualmente bilhões em emendas parlamentares com filtros por estado, município, autor e área de aplicação.
            </p>
          </div>

          <div className="rounded-3xl bg-card border border-border shadow-elegant overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/50">
              <span className="h-3 w-3 rounded-full bg-destructive/50" />
              <span className="h-3 w-3 rounded-full bg-chart-4/60" />
              <span className="h-3 w-3 rounded-full bg-accent/60" />
              <span className="ml-3 text-xs text-muted-foreground font-medium">painel.monitordeemendas.br</span>
            </div>
            <div
              className="relative w-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center"
              style={{ aspectRatio: "16 / 9" }}
            >
              <div className="text-center px-6">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-soft">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm md:text-base font-medium text-muted-foreground max-w-md mx-auto">
                  [Área reservada para embed do Power BI — O painel interativo será carregado aqui]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IA */}
      <section id="ia" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Inteligência Artificial
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como a IA Generativa Trabalha</h2>
            <p className="mt-3 text-muted-foreground">
              Combinamos dados oficiais com modelos de linguagem para entregar transparência acessível a qualquer cidadão.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                title: "Dados Limpos",
                desc: "Coletamos direto do Portal da Transparência via API oficial — sem intermediários, sem viés.",
              },
              {
                icon: MapPin,
                title: "Filtro Regional",
                desc: "Focado no que importa para sua cidade e estado. Acompanhe o dinheiro que chega perto de você.",
              },
              {
                icon: Sparkles,
                title: "Resumos com IA",
                desc: "A inteligência artificial traduz o \"tecniquês\" do governo para um português claro e direto.",
              },
            ].map((c) => (
              <div key={c.title} className="group p-7 rounded-2xl bg-card border border-border hover:shadow-elegant hover:-translate-y-1 transition-all">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-soft mb-5">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="sobre" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span>Monitor de Emendas</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md md:text-right leading-relaxed">
              Copyright © 2026 Monitor de Emendas.<br />
              Dados extraídos via API pública do Portal da Transparência do Governo Federal. Projeto acadêmico/independente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
