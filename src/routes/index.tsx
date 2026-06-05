import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, MapPin, Sparkles, Menu, X, ArrowRight, AlertTriangle, Radar, MessageCircle, Send, ShieldAlert, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  ESFERAS_PERMITIDAS,
  fetchCatalogoUnificado,
  type CatalogoRow,
  type EsferaPermitida,
} from "@/lib/supabaseExternal";

type ChatMessage = { role: "user" | "bot" | "system"; text: string; pending?: boolean };

type NivelAlerta = "anomalia" | "insight" | "monitorando";

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
  const [parlamentarPopoverOpen, setParlamentarPopoverOpen] = useState(false);
  const [perfilTexto, setPerfilTexto] = useState<string | null>(null);
  const [dossieTexto, setDossieTexto] = useState<string | null>(null);
  const [nivelAlerta, setNivelAlerta] = useState<NivelAlerta | null>(null);
  const [fontesTexto, setFontesTexto] = useState<string | null>(null);

  // Catálogo unificado vindo do Supabase (parlamentares + institucional).
  const [catalogo, setCatalogo] = useState<CatalogoRow[]>([]);
  const [catalogoLoading, setCatalogoLoading] = useState(true);
  const [catalogoErro, setCatalogoErro] = useState<string | null>(null);

  // Dropdown 1: esfera. Dropdown 2: nome. O esferaPopover e o nomePopover são independentes.
  const [esferaSelecionada, setEsferaSelecionada] = useState<EsferaPermitida | null>(null);
  const [esferaPopoverOpen, setEsferaPopoverOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCatalogoUnificado()
      .then((rows) => {
        if (!active) return;
        setCatalogo(rows);
        setCatalogoErro(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error("Falha ao carregar catálogo:", err);
        setCatalogoErro("Não foi possível carregar o catálogo de parlamentares.");
      })
      .finally(() => {
        if (active) setCatalogoLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Esferas disponíveis: apenas as permitidas no MVP, e somente se houver registros.
  const esferasDisponiveis = useMemo<EsferaPermitida[]>(() => {
    const presentes = new Set(catalogo.map((r) => (r.Esfera_Carimbo ?? "").trim()));
    return ESFERAS_PERMITIDAS.filter((e) => presentes.has(e));
  }, [catalogo]);

  // Nomes filtrados pela esfera escolhida no Dropdown 1.
  const nomesFiltrados = useMemo<string[]>(() => {
    if (!esferaSelecionada) return [];
    const set = new Set<string>();
    for (const row of catalogo) {
      if ((row.Esfera_Carimbo ?? "").trim() === esferaSelecionada) {
        const nome = (row.Nome_Proponente ?? "").trim();
        if (nome) set.add(nome);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [catalogo, esferaSelecionada]);

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
      const res = await fetch("https://giacomonicdata.com/webhook/pegar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem_usuario: pergunta,
          parlamentar: parlamentarSelecionado,
          parlamentar_selecionado: parlamentarSelecionado,
          esfera: esferaSelecionada,
          contexto_painel: {
            parlamentar_selecionado: parlamentarSelecionado,
            esfera_selecionada: esferaSelecionada,
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const response = (await res.json()) as {
        output?: string;
        perfil?: string;
        dossie?: string;
        fontes?: string;
        nivel_alerta?: string;
      };

      const str = (v: unknown): string | null =>
        typeof v === "string" && v.trim() ? v : null;

      setPerfilTexto(str(response.perfil));
      setDossieTexto(str(response.dossie));

      const nivelRaw = (response.nivel_alerta ?? "").trim().toLowerCase();
      setNivelAlerta(
        nivelRaw === "anomalia" || nivelRaw === "insight" || nivelRaw === "monitorando"
          ? (nivelRaw as NivelAlerta)
          : null,
      );

      setFontesTexto(
        typeof response.fontes === "string" && response.fontes.trim() ? response.fontes : null,
      );

      setMessages((prev) => {
        const next = prev.filter((m) => !m.pending);
        return [
          ...next,
          { role: "bot", text: str(response.output) ?? "(resposta vazia)" },
        ];
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
          </div>
        </div>
      </section>

      {/* Radar de Auditoria — Dashboard de Auditoria (Chat + Painel de Resultados) */}
      <section id="radar" className="py-16 md:py-24" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="mx-auto max-w-7xl px-6">
          {/* Cabeçalho movido para cima da área de pesquisa */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radar className="h-6 w-6 text-accent" />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">
              Beta
            </span>
          </div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Radar de Auditoria</h2>
            <p className="mt-3 text-muted-foreground">
              O cão de guarda digital: ao consultar os dados com apoio da nossa IA, varremos portais oficiais e notícias em tempo real para identificar e sinalizar, nas caixas ao lado, possíveis movimentações suspeitas.
            </p>
          </div>

          {/* Grid 2 colunas: Chat (esquerda) + Painel de Resultados (direita) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Esquerda — Controle da IA */}
            <aside className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-card border border-border shadow-elegant overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/50">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Consultoria de Transparência</h3>
                  <p className="text-xs text-muted-foreground">Pergunte diretamente à base de dados</p>
                </div>
              </div>
              {/* Seletor de Parlamentar (contexto do painel) */}
              <div className="px-5 py-3 border-b border-border bg-card">
                <p className="text-[11px] text-muted-foreground/80 italic tracking-wide mb-2">
                  Para investigar com a IA, selecione a esfera e, em seguida, o parlamentar/instituição.
                </p>

                {/* Dropdown 1 — Esfera / Categoria */}
                <Popover open={esferaPopoverOpen} onOpenChange={setEsferaPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={esferaPopoverOpen}
                      disabled={catalogoLoading || !!catalogoErro}
                      className="w-full inline-flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3.5 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={cn(!esferaSelecionada && "text-muted-foreground font-normal")}>
                        {catalogoLoading
                          ? "Carregando catálogo..."
                          : catalogoErro
                            ? "Erro ao carregar catálogo"
                            : (esferaSelecionada ?? "Selecionar esfera / categoria...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Nenhuma esfera disponível.</CommandEmpty>
                        <CommandGroup>
                          {esferasDisponiveis.map((esfera) => (
                            <CommandItem
                              key={esfera}
                              value={esfera}
                              onSelect={() => {
                                setEsferaSelecionada(esfera);
                                setParlamentarSelecionado(null);
                                setEsferaPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  esferaSelecionada === esfera ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {esfera}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Faixa de aviso para Ex-Parlamentar / Histórico */}
                {esferaSelecionada === "Ex-Parlamentar / Histórico" && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-yellow-400/40 bg-yellow-300/15 px-3 py-2 text-xs font-medium text-yellow-900 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-300" />
                    <span>Atenção: Parlamentar sem mandato ativo na atual legislatura.</span>
                  </div>
                )}

                {/* Dropdown 2 — Nome do Parlamentar / Instituição */}
                <Popover open={parlamentarPopoverOpen} onOpenChange={setParlamentarPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={parlamentarPopoverOpen}
                      disabled={!esferaSelecionada || nomesFiltrados.length === 0}
                      className="mt-2 w-full inline-flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3.5 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={cn(!parlamentarSelecionado && "text-muted-foreground font-normal")}>
                        {!esferaSelecionada
                          ? "Selecione uma esfera primeiro..."
                          : (parlamentarSelecionado ?? "Selecionar parlamentar / instituição...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar parlamentar..." />
                      <CommandList>
                        <CommandEmpty>Nenhum parlamentar encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="__limpar__"
                            onSelect={() => {
                              setParlamentarSelecionado(null);
                              setParlamentarPopoverOpen(false);
                            }}
                            className="text-muted-foreground italic"
                          >
                            Limpar seleção
                          </CommandItem>
                          {nomesFiltrados.map((nome) => (
                            <CommandItem
                              key={nome}
                              value={nome}
                              onSelect={() => {
                                setParlamentarSelecionado(nome);
                                setParlamentarPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  parlamentarSelecionado === nome ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {catalogoErro && (
                  <p className="mt-2 text-xs text-destructive">{catalogoErro}</p>
                )}
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
                  disabled={!parlamentarSelecionado || sending}
                  placeholder={
                    parlamentarSelecionado
                      ? "Pergunte sobre uma emenda, parlamentar ou município..."
                      : "Selecione um parlamentar acima para começar..."
                  }
                  className="flex-1 bg-secondary/60 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                />
                <button
                  type="submit"
                  disabled={!parlamentarSelecionado || sending || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </aside>

            {/* Coluna Direita — Painel de Resultados */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Card 1 — Perfil do Parlamentar / Instituição */}
              <div className="relative p-6 rounded-2xl border border-border bg-white shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4" />
                    Perfil
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Pronto para análise
                  </span>
                </div>
                {perfilTexto ? (
                  <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed prose-strong:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{perfilTexto}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
                    Aguardando dados... Selecione um parlamentar e faça uma pergunta para que a IA monte o perfil aqui.
                  </p>
                )}
              </div>

              {/* Card 2 — Dossiê de Auditoria e Alertas */}
              <div className="relative p-6 rounded-2xl border border-border bg-white shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <ShieldAlert className="h-4 w-4" />
                    Dossiê de Auditoria
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Pronto para análise
                  </span>
                </div>
                {(() => {
                  const styles: Record<NivelAlerta, { icon: typeof AlertTriangle; tag: string; color: string; border: string; bg: string }> = {
                    anomalia: { icon: AlertTriangle, tag: "Anomalia", color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5" },
                    insight: { icon: ShieldAlert, tag: "Insight", color: "text-chart-4", border: "border-chart-4/30", bg: "bg-chart-4/5" },
                    monitorando: { icon: Radar, tag: "Monitorando", color: "text-accent", border: "border-accent/30", bg: "bg-accent/5" },
                  };
                  if (!dossieTexto) {
                    return (
                      <div className="p-4 rounded-xl border border-border bg-secondary/30">
                        <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
                          Aguardando dados... O nível de alerta (Anomalia, Insight ou Monitorando) será definido pela IA.
                        </p>
                      </div>
                    );
                  }
                  const s = nivelAlerta ? styles[nivelAlerta] : null;
                  const Icon = s?.icon;
                  return (
                    <div
                      className={`p-5 rounded-xl border ${s ? `${s.border} ${s.bg}` : "border-border bg-secondary/30"}`}
                    >
                      {s && Icon && (
                        <span
                          className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${s.color} mb-2`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {s.tag}
                        </span>
                      )}
                      <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed prose-strong:text-foreground prose-a:text-primary">
                        <ReactMarkdown>{dossieTexto}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Card 3 — Fontes e Fatos */}
              <div className="relative p-6 rounded-2xl border border-border bg-white shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Database className="h-4 w-4" />
                    Fontes e Fatos
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Pronto para análise
                  </span>
                </div>
                {fontesTexto ? (
                  <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed prose-a:text-primary prose-a:break-words hover:prose-a:underline">
                    <ReactMarkdown
                      components={{
                        a: ({ node: _node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {fontesTexto}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
                    Aguardando dados... As fontes oficiais e notícias usadas pela IA aparecerão aqui.
                  </p>
                )}
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

      {/* Sobre o Projeto */}
      <section id="sobre" className="py-16 md:py-24 bg-surface border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Sobre o Projeto</h2>
            <p className="mt-3 text-muted-foreground">
              Uma iniciativa independente de transparência pública que utiliza engenharia de dados e inteligência artificial para democratizar o acesso à informação sobre emendas parlamentares no Brasil.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Sobre o Desenvolvedor</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                O Emenda Insight IA foi idealizado e arquitetado por{" "}
                <a
                  href="https://www.linkedin.com/in/carlo-giacomoni/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-glow hover:underline underline-offset-2 transition-colors font-medium"
                >
                  Carlo de Souza Giacomoni
                </a>
                , Analista de Dados Júnior e graduando em Ciência de Dados pela UNINTER. O projeto nasceu do objetivo de aplicar engenharia de dados em nuvem e IA generativa para facilitar o acesso da população à transparência governamental.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2 font-bold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span>Monitor de Emendas</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Dados extraídos via API pública do Portal da Transparência do Governo Federal. Projeto acadêmico/independente.
            </p>
            <p className="text-xs text-muted-foreground">
              Copyright © 2026 Monitor de Emendas. Desenvolvido por{" "}
              <a
                href="https://www.linkedin.com/in/carlo-giacomoni/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-glow hover:underline underline-offset-2 transition-colors font-medium"
              >
                Carlo de Souza Giacomoni
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
