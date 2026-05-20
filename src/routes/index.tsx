import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, MapPin, Sparkles, Menu, X, ArrowRight, AlertTriangle, Radar, MessageCircle, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";

type ChatMessage = { role: "user" | "bot" | "system"; text: string; pending?: boolean };

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: 'Olá! Faça perguntas como: "Quais emendas chegaram em Florianópolis em 2025?"' },
  ]);
  const [sending, setSending] = useState(false);
  const [parlamentarSelecionado, setParlamentarSelecionado] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const pergunta = input.trim();
    if (!pergunta || sending) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: pergunta },
      { role: "bot", text: "Pensando...", pending: true },
    ]);

    try {
      const res = await fetch("https://702c09144dd030.lhr.life/webhook-test/chat-auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem_usuario: pergunta,
          contexto_painel: {
            parlamentar_selecionado: parlamentarSelecionado,
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") ? await res.json() : await res.text();
      const reply =
        typeof data === "string"
          ? data
          : data?.resposta ?? data?.answer ?? data?.message ?? data?.output ?? JSON.stringify(data);
      setMessages((prev) => {
        const next = prev.filter((m) => !m.pending);
        return [...next, { role: "bot", text: String(reply) }];
      });
    } catch (err) {
      setMessages((prev) => {
        const next = prev.filter((m) => !m.pending);
        return [
          ...next,
          {
            role: "system",
            text: "Não foi possível conectar à Consultoria de Transparência. Verifique sua conexão e tente novamente.",
          },
        ];
      });
    } finally {
      setSending(false);
    }
  };

  const nav = [
    { label: "Início", href: "#inicio" },
    { label: "O Dashboard", href: "#dashboard" },
    { label: "Radar de Auditoria", href: "#radar" },
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
              Monitor de Emendas Brasil
              <span className="mt-3 inline-flex items-center gap-2">
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-3xl md:text-5xl font-extrabold shadow-elegant">
                  SC
                </span>
                <span className="text-sm md:text-base font-medium text-muted-foreground">Santa Catarina</span>
              </span>
            </h1>
            <h2 className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transparência com Auditoria Digital: Monitorando o destino das emendas parlamentares com IA e detecção de anomalias.
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

          <div className="space-y-10 md:space-y-14">
            <div className="rounded-3xl bg-card border border-border shadow-elegant overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/50">
                <span className="h-3 w-3 rounded-full bg-destructive/50" />
                <span className="h-3 w-3 rounded-full bg-chart-4/60" />
                <span className="h-3 w-3 rounded-full bg-accent/60" />
                <span className="ml-3 text-xs text-muted-foreground font-medium">painel.monitordeemendas.br/sc</span>
              </div>
              <div className="relative w-full bg-muted aspect-video">
                <iframe
                  title="Dashboard Power BI - Monitor de Emendas SC"
                  src="https://app.powerbi.com/view?r=eyJrIjoiOTBmMWRhNzItZmM0Zi00Zjg4LWJhYWMtMzViMmVmYzNmZGVkIiwidCI6ImQ2YjQ0ZTk0LWJiMDktNGE1Ni05ZjMxLWJlYmVjYmFhMmQ0ZCJ9"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            </div>

            {/* Chat Investigativo */}
            <aside className="mx-auto w-full max-w-3xl rounded-3xl bg-card border border-border shadow-elegant overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/50">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Consultoria de Transparência</h3>
                  <p className="text-xs text-muted-foreground">Pergunte diretamente à base de dados</p>
                </div>
              </div>
              <div className="flex-1 p-5 space-y-3 min-h-[280px] bg-gradient-to-b from-transparent to-secondary/20">
                {messages.map((m, i) => {
                  const base = "max-w-[90%] text-sm rounded-2xl px-4 py-2.5 whitespace-pre-wrap";
                  if (m.role === "user") {
                    return (
                      <div key={i} className={`${base} ml-auto bg-primary text-primary-foreground rounded-tr-sm`}>
                        {m.text}
                      </div>
                    );
                  }
                  if (m.role === "system") {
                    return (
                      <div key={i} className={`${base} bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm`}>
                        {m.text}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={`${base} bg-secondary text-foreground rounded-tl-sm ${m.pending ? "italic opacity-70" : ""}`}>
                      {m.text}
                    </div>
                  );
                })}
              </div>
              <form className="border-t border-border p-3 flex items-center gap-2 bg-card" onSubmit={handleSend}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  placeholder="Pergunte sobre uma emenda, parlamentar ou município..."
                  className="flex-1 bg-secondary/60 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </aside>
          </div>
        </div>
      </section>

      {/* Radar de Auditoria */}
      <section id="radar" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radar className="h-6 w-6 text-accent" />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">Beta</span>
          </div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Radar de Auditoria</h2>
            <p className="mt-3 text-muted-foreground">
              O cão de guarda digital: nossa IA varre portais oficiais e notícias em tempo real para sinalizar movimentações suspeitas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: AlertTriangle, tag: "Anomalia", color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5" },
              { icon: ShieldAlert, tag: "Insight", color: "text-chart-4", border: "border-chart-4/30", bg: "bg-chart-4/5" },
              { icon: Radar, tag: "Monitorando", color: "text-accent", border: "border-accent/30", bg: "bg-accent/5" },
            ].map((card, i) => (
              <div key={i} className={`relative p-6 rounded-2xl border ${card.border} ${card.bg} backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                    {card.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Ao vivo
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  [Aguardando dados... A IA está varrendo portais de transparência e notícias para identificar possíveis anomalias neste parlamentar/município.]
                </p>
              </div>
            ))}
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
