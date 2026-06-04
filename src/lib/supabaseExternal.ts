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
  const [a, b] = await Promise.all([
    supabaseCatalogo.from("catalogo_parlamentares").select(cols),
    supabaseCatalogo.from("catalogo_institucional").select(cols),
  ]);
  if (a.error) throw a.error;
  if (b.error) throw b.error;
  return [...((a.data ?? []) as CatalogoRow[]), ...((b.data ?? []) as CatalogoRow[])];
}