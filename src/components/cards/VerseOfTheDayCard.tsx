import { useEffect, useState } from 'react'
import { getDailyVerse, type BibleVerse } from '../../services/bibleVerseService'
import { bibleVerses } from '../../data/bibleVerses'

function VerseOfTheDayCard() {
  const [verse, setVerse] = useState<BibleVerse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDailyVerse()
      .then(setVerse)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load verse.'))
      .finally(() => setLoading(false))
  }, [])

  const verseCategory = verse
    ? (bibleVerses.find(v => v.display === verse.reference)?.category ?? '')
    : ''

  return (
    <div className="card bible-verse">
      {loading && <p>Loading verse...</p>}
      {error && <p className="form-error">{error}</p>}
      {verse && (
        <>
          <div className="bible-verse-header">
            <span className="bible-verse-label">Verse of the Day</span>
            <span className="bible-verse-category">{verseCategory}</span>
          </div>
          <div className="bible-verse-reference">— {verse.reference} (KJV)</div>
          <blockquote className="bible-verse-text">"{verse.text}"</blockquote>
        </>
      )}
    </div>
  )
}

export default VerseOfTheDayCard
