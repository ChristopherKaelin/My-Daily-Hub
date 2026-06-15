import { supabase } from '../lib/supabaseClient'

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession()
  return session !== null
}

export const getCurrentUserId = async (): Promise<string | null> => {
  const session = await getSession()
  return session?.user?.id ?? null
}
