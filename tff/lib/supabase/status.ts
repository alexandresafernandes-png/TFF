const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

export const missingSupabaseEnvNames: readonly string[] = REQUIRED_ENV_VARS.filter(
  (name) => !process.env[name]
)

export const hasSupabaseConfig: boolean = missingSupabaseEnvNames.length === 0
