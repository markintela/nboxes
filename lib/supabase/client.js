import { createBrowserClient } from "@supabase/ssr";

// Chama createClient() dentro do componente que for usá-lo — é barato,
// é o padrão recomendado pelo Supabase para Client Components no Next.js.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
