import { createClient } from "@supabase/supabase-js";

// Conexão com o Supabase externo (catálogo de parlamentares/institucional).
// A anon key é publishable — segura para uso no client.
const SUPABASE_URL = "https://xjvvvctneqwenswgnifk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdnZ2Y3RuZXF3ZW5zd2duaWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDQ0OTgsImV4cCI6MjA5NjEyMDQ5OH0.VHR7F3DsjatoVCvNldWgdPhuQt1VtQYmlnCW69P1BOI";

export const supabaseCatalogo = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type CatalogoRow = {
  Nome_Proponente: string;
  Tipo_Autor: string | null;
  Esfera_Carimbo: string | null;
};

// 27 UFs do Brasil (Dropdown 1).
export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
export type UF = (typeof UFS_BRASIL)[number];

// Busca os nomes de parlamentares filtrando ESTRITAMENTE por Esfera_Carimbo == uf
// na tabela catalogo_parlamentares (sem união com catalogo_institucional).
// Paginação manual via .range() para evitar o teto padrão de 1000 linhas.
export async function fetchNomesPorUF(uf: string): Promise<string[]> {
  const PAGE = 1000;
  const out: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseCatalogo
      .from("catalogo_parlamentares")
      .select("Nome_Proponente, Esfera_Carimbo")
      .eq("Esfera_Carimbo", uf)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as CatalogoRow[];
    for (const r of rows) {
      const nome = (r.Nome_Proponente ?? "").trim();
      if (nome) out.push(nome);
    }
    if (rows.length < PAGE) break;
  }
  const set = new Set(out);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}