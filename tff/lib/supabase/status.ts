// Explicit property access so Next.js inlines NEXT_PUBLIC_* values in client bundles.
// Dynamic key access (process.env[name]) is NOT replaced by Next.js webpack and would
// always read as undefined on the client side.
const _url = process.env.NEXT_PUBLIC_SUPABASE_URL
const _key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const missingSupabaseEnvNames: readonly string[] = [
  ...(_url ? [] : ["NEXT_PUBLIC_SUPABASE_URL"]),
  ...(_key ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
]

export const hasSupabaseConfig: boolean = !!(_url && _key)
