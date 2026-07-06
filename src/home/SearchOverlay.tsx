import { useEffect, useMemo, useRef, useState } from 'react'
import { useSystem } from '../system/SystemContext'
import { Icon, type IconName } from '../ui/Icon'
import { Pressable } from '../ui/Pressable'
import { APPS, LINK_APPS } from '../apps/registry'
import { projectId, projects, skills } from '../content'

interface Result {
  icon: IconName
  title: string
  sub: string
  kind: string
  action: () => void
}

export function SearchOverlay() {
  const { navigate, goBack } = useSystem()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const index = useMemo<Result[]>(() => {
    const open = (path: string) => () => {
      // Replace the search entry so back from the target skips the overlay.
      window.history.back()
      setTimeout(() => navigate(path), 60)
    }
    const items: Result[] = []
    for (const app of APPS) {
      items.push({ icon: app.icon, title: app.label, sub: 'App', kind: 'app', action: open(app.id) })
    }
    for (const link of LINK_APPS) {
      items.push({
        icon: link.icon, title: link.label, sub: 'Opens in new tab', kind: 'link',
        action: () => window.open(link.url, '_blank', 'noopener'),
      })
    }
    for (const p of projects) {
      items.push({
        icon: 'code', title: p.title, kind: `project ${p.tags?.join(' ') ?? ''} ${p.description}`,
        sub: p.tags?.slice(0, 3).join(' · ') ?? 'Project', action: open(`projects/${projectId(p)}`),
      })
    }
    for (const group of skills) {
      for (const item of group.ul) {
        const labels = typeof item === 'string' ? [item] : [item.title, ...item.ul]
        for (const label of labels) {
          items.push({ icon: 'memory', title: label, sub: `Skill · ${group.heading}`, kind: 'skill', action: open('resume') })
        }
      }
    }
    return items
  }, [navigate])

  const q = query.trim().toLowerCase()
  const results = q
    ? index.filter(r => `${r.title} ${r.sub} ${r.kind}`.toLowerCase().includes(q)).slice(0, 9)
    : index.slice(0, 5)

  return (
    <div className="search-root" onClick={goBack}>
      <div className="search-sheet" onClick={e => e.stopPropagation()}>
        <div className="search-field">
          <Icon name="search" size={20} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search apps, projects, skills…"
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && results.length > 0) results[0].action()
            }}
            aria-label="Search portfolio"
          />
          {query && (
            <Pressable className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setQuery('')} aria-label="Clear">
              <Icon name="close" size={18} />
            </Pressable>
          )}
        </div>
        <div className="search-results">
          {results.map((r, i) => (
            <Pressable key={`${r.title}-${i}`} className="list-item" onClick={r.action}>
              <span className="li-icon"><Icon name={r.icon} size={18} /></span>
              <span className="li-text">
                <div className="li-headline">{r.title}</div>
                <div className="li-support">{r.sub}</div>
              </span>
              <Icon name="chevron_right" size={18} style={{ color: 'var(--md-on-surface-variant)' }} />
            </Pressable>
          ))}
          {results.length === 0 && (
            <div className="search-empty">No results for “{query}”</div>
          )}
        </div>
      </div>
    </div>
  )
}
