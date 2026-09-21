import { bibleVerses } from '../../../data/bibleVerses'
import VerseOfTheDayCard from '../../cards/VerseOfTheDayCard'

// Derive categories from bibleVerses data
const categoryMap = bibleVerses.reduce<Record<string, string[]>>((acc, verse) => {
  if (!acc[verse.category]) acc[verse.category] = []
  acc[verse.category].push(verse.display)
  return acc
}, {})

const categories = Object.entries(categoryMap)

function BibleVerse() {

  return (
    <div className="bible-page">
      <p className="bible-intro">
        The Verse of the Day is drawn from a curated list of {bibleVerses.length} of the most searched Bible verses,
        organized across {categories.length} themes. A new verse rotates in each day.
      </p>

      <VerseOfTheDayCard />

      <div className="bible-categories">
        {categories.map(([name, references]) => (
          <div key={name} className="card bible-category-card">
            <h3 className="bible-category-name">{name}</h3>
            <ul className="bible-category-list">
              {references.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BibleVerse
