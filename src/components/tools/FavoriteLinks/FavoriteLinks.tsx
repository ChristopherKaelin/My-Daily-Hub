import { useState, useEffect } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react'
import { getLinks, createLink, updateLink, deleteLink, swapLinkOrder, MAX_LINKS } from '../../../services/linksService'
import { type FavoriteLink } from '../../../types'
import ConfirmModal from '../../common/ConfirmModal'
import { EditButton } from '../../common/EditButton'
import { DeleteButton } from '../../common/DeleteButton'
import { AddButton } from '../../common/AddButton'
import { RefreshButton } from '../../common/RefreshButton'
import { CancelButton } from '../../common/CancelButton'
import styles from './FavoriteLinks.module.css'

function validateForm(title: string, url: string): string | null {
  if (!title.trim()) return 'Title is required.'
  if (!url.trim()) return 'URL is required.'
  try {
    const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    new URL(normalized)
  } catch {
    return 'Please enter a valid URL.'
  }
  return null
}

export function FavoriteLinks() {
  const [links, setLinks] = useState<FavoriteLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', url: '' })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getLinks()
        if (mounted) setLinks(data)
      } catch {
        if (mounted) setError('Failed to load links.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!formError) return
    const t = setTimeout(() => setFormError(null), 4000)
    return () => clearTimeout(t)
  }, [formError])

  async function handleRefresh() {
    setIsRefreshing(true)
    setError(null)
    try {
      const data = await getLinks()
      setLinks(data)
    } catch {
      setError('Failed to refresh links.')
    } finally {
      setIsRefreshing(false)
    }
  }

  function openAddForm() {
    setEditingId(null)
    setFormData({ title: '', url: '' })
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditForm(link: FavoriteLink) {
    setEditingId(link.id)
    setFormData({ title: link.title, url: link.url })
    setFormError(null)
    setIsFormOpen(true)
  }

  function cancelForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData({ title: '', url: '' })
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validateForm(formData.title, formData.url)
    if (validationError) {
      setFormError(validationError)
      return
    }

    if (!editingId && links.length >= MAX_LINKS) {
      setFormError(`You've reached the ${MAX_LINKS}-link limit.`)
      return
    }

    try {
      if (editingId) {
        const updated = await updateLink(editingId, formData.title, formData.url)
        if (updated) {
          setLinks(prev => prev.map(l => l.id === editingId ? updated : l))
        }
      } else {
        const created = await createLink(formData.title, formData.url)
        if (created) {
          setLinks(prev => [...prev, created])
        }
      }
      cancelForm()
    } catch {
      setFormError('Failed to save link.')
    }
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const idx = links.findIndex(l => l.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= links.length) return
    const updated = await swapLinkOrder(links, id, links[swapIdx].id)
    setLinks(updated)
  }

  async function handleDelete(id: string) {
    const ok = await deleteLink(id)
    if (ok) {
      setLinks(prev => prev.filter(l => l.id !== id))
    } else {
      setError('Failed to delete link.')
    }
    setConfirmDeleteId(null)
  }

  const confirmDeleteLink = links.find(l => l.id === confirmDeleteId)

  return (
    <div className={`${styles.linksPage} zone-reflection`}>
      <div className={styles.pageHeader}>
        <h2>Favorite Links</h2>
        <div className={styles.headerActions}>
          <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing} label="Refresh links" />
          {isFormOpen
            ? <CancelButton onClick={() => { setIsFormOpen(false); setEditingId(null) }} />
            : links.length < MAX_LINKS && <AddButton onClick={openAddForm} label="" />
          }
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {isFormOpen && (
        <form className={styles.linkForm} onSubmit={handleSubmit} noValidate>
          <h3 className={styles.formTitle}>{editingId ? 'Edit Link' : 'Add Link'}</h3>
          {formError && <p className={styles.formError}>{formError}</p>}
          <div className={styles.formField}>
            <label htmlFor="link-title">Title</label>
            <input
              id="link-title"
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. GitHub"
              maxLength={100}
              autoFocus
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="link-url">URL</label>
            <input
              id="link-url"
              type="text"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="e.g. https://github.com"
              maxLength={2048}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className="btn btn-save">
              {editingId ? 'Save Changes' : 'Add Link'}
            </button>
            <button type="button" className="btn btn-cancel" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.stateMsg}>Loading…</p>
      ) : links.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No links yet. Add your first favorite link!</p>
        </div>
      ) : (
        <ul className={styles.linkList}>
          {links.map((link, index) => (
            <li key={link.id} className={styles.linkItem}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkAnchor}
                title={link.url}
              >
                <span className={styles.linkTitle}>{link.title}</span>
                <span className={styles.linkUrl}>{link.url}</span>
              </a>
              <div className={styles.linkActions}>
                <button
                  className={styles.reorderBtn}
                  onClick={() => handleMove(link.id, 'up')}
                  disabled={index === 0}
                  title="Move up"
                  aria-label="Move up"
                >
                  <ArrowUpIcon size={16} weight="bold" />
                </button>
                <button
                  className={styles.reorderBtn}
                  onClick={() => handleMove(link.id, 'down')}
                  disabled={index === links.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >
                  <ArrowDownIcon size={16} weight="bold" />
                </button>
                <EditButton onClick={() => openEditForm(link)} />
                <DeleteButton onClick={() => setConfirmDeleteId(link.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {links.length >= MAX_LINKS && !isFormOpen && (
        <p className={styles.limitNote}>
          {MAX_LINKS}-link limit reached. Delete a link to add another.
        </p>
      )}

      {confirmDeleteId && confirmDeleteLink && (
        <ConfirmModal
          title="Delete Link"
          message={`Delete "${confirmDeleteLink.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
