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

// Esferas permitidas no MVP (exibidas no Dropdown 1).
export const ESFERAS_PERMITIDAS = ["SC", "Federal / Nacional", "Ex-Parlamentar / Histórico"] as const;
export type EsferaPermitida = (typeof ESFERAS_PERMITIDAS)[number];

export async function fetchCatalogoUnificado(): Promise<CatalogoRow[]> {
  const cols = "Nome_Proponente, Tipo_Autor, Esfera_Carimbo";
  // Supabase aplica um teto padrão de 1000 linhas por requisição. Para garantir
  // que TODOS os parlamentares apareçam no dropdown (inclusive nomes do final
  // do alfabeto), paginamos manualmente via .range() até esgotar os registros.
  const PAGE = 1000;
  const fetchAll = async (table: "catalogo_parlamentares" | "catalogo_institucional") => {
    const out: CatalogoRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabaseCatalogo
        .from(table)
        .select(cols)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      const rows = (data ?? []) as CatalogoRow[];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out;
  };
  const [a, b] = await Promise.all([
    fetchAll("catalogo_parlamentares"),
    fetchAll("catalogo_institucional"),
  ]);
  return [...a, ...b];
}