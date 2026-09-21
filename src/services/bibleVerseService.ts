import { bibleVerses } from '../data/bibleVerses'

const API_KEY = import.meta.env.VITE_BIBLE_API_KEY
const BIBLE_ID = 'de4e12af7f28f599-01' // KJV
const CACHE_KEY_PREFIX = 'mdh_bible_verse_'

export interface BibleVerse {
  reference: string
  text: string
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function loadCache(): BibleVerse | null {
  const key = CACHE_KEY_PREFIX + getTodayKey()
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

function saveCache(verse: BibleVerse): void {
  // Clear any old cache keys
  Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_KEY_PREFIX))
    .forEach(k => localStorage.removeItem(k))

  const key = CACHE_KEY_PREFIX + getTodayKey()
  localStorage.setItem(key, JSON.stringify(verse))
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function getDailyVerse(): Promise<BibleVerse> {
  const cached = loadCache()
  if (cached) return cached

  const dayOfYear = getDayOfYear()
  const verseRef = bibleVerses[dayOfYear % bibleVerses.length]

  const url = `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/verses/${verseRef.reference}?content-type=text&include-verse-numbers=false`

  const response = await fetch(url, {
    headers: {
      'api-key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to load verse. Please try again later.')
  }

  const json = await response.json()
  const text = stripHtml(json.data.content)

  const verse: BibleVerse = {
    reference: verseRef.display,
    text,
  }

  saveCache(verse)
  return verse
}
