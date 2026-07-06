import { AppScreen } from '../ui/AppScreen'
import { Icon, type IconName } from '../ui/Icon'
import { about, meta } from '../content'

const SOCIAL_ICONS: Record<string, IconName> = {
  Github: 'github',
  LinkedIn: 'linkedin',
  Mail: 'mail',
}

export function AboutApp() {
  const initial = meta.name.trim().charAt(0)
  return (
    <AppScreen title={meta.name} noHeadline>
      <div className="about-hero page-fade">
        <div className="avatar">{initial}</div>
        <h1>{meta.name}</h1>
        <p className="about-role">{meta.designation}</p>
        <div className="chip-row">
          {meta.social.map(s => (
            <a
              key={s.label}
              className="chip chip-tonal ripple-host state-layer"
              href={s.url}
              target={s.url.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
            >
              <Icon name={SOCIAL_ICONS[s.label] ?? 'link'} size={16} />
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <hr className="divider" style={{ margin: '18px 0' }} />
      {about.content.map((para, i) => (
        <p key={i} className="about-para">{para}</p>
      ))}
    </AppScreen>
  )
}
