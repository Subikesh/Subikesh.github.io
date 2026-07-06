import { AppScreen } from '../ui/AppScreen'
import { Icon, type IconName } from '../ui/Icon'
import { spawnRipple } from '../ui/Pressable'
import { meta } from '../content'

const SOCIAL_ICONS: Record<string, IconName> = {
  Github: 'github',
  LinkedIn: 'linkedin',
  Mail: 'mail',
}

const SUPPORT_TEXT: Record<string, string> = {
  Github: 'Browse my open-source work',
  LinkedIn: 'Connect professionally',
}

function supportText(label: string, url: string): string {
  if (url.startsWith('mailto:')) return url.slice(7)
  return SUPPORT_TEXT[label] ?? url.replace(/^https?:\/\//, '')
}

export function ContactApp() {
  return (
    <AppScreen title="Contact">
      <div className="page-fade">
        {meta.social.map(s => (
          <a
            key={s.label}
            className="list-item ripple-host state-layer"
            href={s.url}
            target={s.url.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
            onPointerDown={spawnRipple}
          >
            <span className="li-icon">
              <Icon name={SOCIAL_ICONS[s.label] ?? 'link'} size={20} />
            </span>
            <span className="li-text">
              <div className="li-headline">{s.label}</div>
              <div className="li-support">{supportText(s.label, s.url)}</div>
            </span>
            <Icon name="open_in_new" size={18} style={{ color: 'var(--md-on-surface-variant)' }} />
          </a>
        ))}

        <div className="section-label">Send a message</div>
        <div className="card contact-form-card">
          <iframe
            src={meta.contactFormUrl}
            title="Contact form"
            loading="lazy"
          />
        </div>
        <p className="contact-note">
          The form above goes straight to my inbox — or just email me directly.
        </p>
      </div>
    </AppScreen>
  )
}
