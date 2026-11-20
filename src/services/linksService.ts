import { supabase } from '../lib/supabaseClient'
import { isAuthenticated, getCurrentUserId } from './authService'
import { type FavoriteLink, DEMO_STORAGE_KEYS } from '../types'

export const MAX_LINKS = 25

// --- Demo Mode ---

function loadDemoLinks(): FavoriteLink[] {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.FAVORITE_LINKS)
  return raw ? JSON.parse(raw) : []
}

function saveDemoLinks(links: FavoriteLink[]): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.FAVORITE_LINKS, JSON.stringify(links))
}

// --- Supabase ---

function rowToLink(row: Record<string, unknown>): FavoriteLink {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    url: row.url as string,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

async function loadAuthLinks(userId: string): Promise<FavoriteLink[]> {
  const { data, error } = await supabase
    .from('favorite_links')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(rowToLink)
}

// --- Public API ---

export async function getLinks(): Promise<FavoriteLink[]> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return loadAuthLinks(userId)
  }
  return loadDemoLinks()
}

export async function createLink(title: string, url: string): Promise<FavoriteLink | null> {
  const normalizedUrl = normalizeUrl(url)

  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const existing = await loadAuthLinks(userId)
    const nextOrder = existing.length > 0 ? Math.max(...existing.map(l => l.displayOrder)) + 1 : 0

    const { data, error } = await supabase
      .from('favorite_links')
      .insert({ user_id: userId, title: title.trim(), url: normalizedUrl, display_order: nextOrder })
      .select()
      .single()

    if (error || !data) return null
    return rowToLink(data)
  }

  const links = loadDemoLinks()
  const nextOrder = links.length > 0 ? Math.max(...links.map(l => l.displayOrder)) + 1 : 0
  const newLink: FavoriteLink = {
    id: crypto.randomUUID(),
    userId: 'demo',
    title: title.trim(),
    url: normalizedUrl,
    displayOrder: nextOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveDemoLinks([...links, newLink])
  return newLink
}

export async function updateLink(id: string, title: string, url: string): Promise<FavoriteLink | null> {
  const normalizedUrl = normalizeUrl(url)

  if (await isAuthenticated()) {
    const { data, error } = await supabase
      .from('favorite_links')
      .update({ title: title.trim(), url: normalizedUrl, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) return null
    return rowToLink(data)
  }

  const links = loadDemoLinks()
  const idx = links.findIndex(l => l.id === id)
  if (idx === -1) return null
  const updated = { ...links[idx], title: title.trim(), url: normalizedUrl, updatedAt: new Date().toISOString() }
  links[idx] = updated
  saveDemoLinks(links)
  return updated
}

export async function deleteLink(id: string): Promise<boolean> {
  if (await isAuthenticated()) {
    const { error } = await supabase.from('favorite_links').delete().eq('id', id)
    return !error
  }

  const links = loadDemoLinks()
  saveDemoLinks(links.filter(l => l.id !== id))
  return true
}

export async function reorderLinks(ids: string[]): Promise<boolean> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return false

    const updates = ids.map((id, index) => ({ id, display_order: index }))
    for (const u of updates) {
      await supabase.from('favorite_links').update({ display_order: u.display_order }).eq('id', u.id)
    }
    return true
  }

  const links = loadDemoLinks()
  const ordered = ids.map((id, index) => {
    const link = links.find(l => l.id === id)
    if (!link) return null
    return { ...link, displayOrder: index }
  }).filter((l): l is FavoriteLink => l !== null)
  saveDemoLinks(ordered)
  return true
}

/** Swaps display_order for two adjacent links. Returns the updated full list. */
export async function swapLinkOrder(links: FavoriteLink[], idA: string, idB: string): Promise<FavoriteLink[]> {
  const a = links.find(l => l.id === idA)
  const b = links.find(l => l.id === idB)
  if (!a || !b) return links

  const orderA = a.displayOrder
  const orderB = b.displayOrder

  if (await isAuthenticated()) {
    await Promise.all([
      supabase.from('favorite_links').update({ display_order: orderB }).eq('id', idA),
      supabase.from('favorite_links').update({ display_order: orderA }).eq('id', idB),
    ])
  }

  const updated = links.map(l => {
    if (l.id === idA) return { ...l, displayOrder: orderB }
    if (l.id === idB) return { ...l, displayOrder: orderA }
    return l
  }).sort((a, b) => a.displayOrder - b.displayOrder)

  if (!(await isAuthenticated())) {
    saveDemoLinks(updated)
  }

  return updated
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
