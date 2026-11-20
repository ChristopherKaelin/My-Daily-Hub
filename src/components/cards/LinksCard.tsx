import { useState, useEffect } from 'react'
import { getLinks } from '../../services/linksService'
import { type FavoriteLink } from '../../types'
import { type Tool } from '../common/Sidebar'
import styles from './Card.module.css'
import linkStyles from './LinksCard.module.css'

const CARD_LIMIT = 5

interface LinksCardProps {
  onNavigate?: (tool: Tool) => void
}

export function LinksCard({ onNavigate }: LinksCardProps) {
  const [links, setLinks] = useState<FavoriteLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getLinks()
      .then(data => setLinks(data.slice(0, CARD_LIMIT)))
      .catch(() => setError('Failed to load links.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={`${styles.card} zone-reflection`}>
        <h3 className={styles.cardTitle}>Favorite Links</h3>
        <p className={styles.cardLoading}>Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.card} zone-reflection`}>
        <h3 className={styles.cardTitle}>Favorite Links</h3>
        <p className={styles.cardError}>{error}</p>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className={`${styles.card} zone-reflection`}>
        <h3 className={styles.cardTitle}>Favorite Links</h3>
        <p className={styles.cardEmpty}>No links saved yet.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.card} zone-reflection`}>
      <button className={styles.cardTitleButton} onClick={() => onNavigate?.('links')}>
        <h3 className={styles.cardTitle}>Favorite Links</h3>
      </button>
      <ul className={linkStyles.cardLinkList}>
        {links.map((link, index) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyles.cardLinkAnchor}
              title={link.url}
            >
              <span className={linkStyles.cardLinkTitle}>{link.title}</span>
              <span className={linkStyles.cardLinkArrow}>↗</span>
            </a>
            {index < links.length - 1 && <div className={styles.taskDivider} />}
          </li>
        ))}
      </ul>
    </div>
  )
}
